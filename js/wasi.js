/* 작은 WASI(preview1) 구현 — 컴파일된 C++ 프로그램(WebAssembly)을 브라우저/Node 에서 실행한다.
 *  - 표준 입출력(cin/cout/cerr), 메모리 안의 파일 시스템(ofstream/ifstream), 시계, 난수, sleep
 *  - 브라우저 워커(js/cpp-run-worker.js)와 검증 도구(tools/validate.js)가 함께 사용한다.
 *
 *  new WasiRuntime({
 *    args: ['main'], files: {'이름': Uint8Array},
 *    write(fd, bytes),               // 1 = stdout, 2 = stderr
 *    readStdin() -> Uint8Array|null, // 입력이 더 필요할 때 (null = EOF). 동기 함수여야 한다.
 *    sleep(ms)                       // 동기 대기 (없으면 바쁜 대기)
 *  })
 */
(function (root) {
  const E = { SUCCESS: 0, BADF: 8, EXIST: 20, INVAL: 28, IO: 29, ISDIR: 31, NOENT: 44, NOSYS: 52, NOTDIR: 54, NOTEMPTY: 55, SPIPE: 70, PERM: 63 };
  const FT = { CHAR: 2, DIR: 3, FILE: 4 };

  class ExitError extends Error {
    constructor(code) { super('exit ' + code); this.code = code; this.isExit = true; }
  }

  class WasiRuntime {
    constructor(opts) {
      this.opts = opts || {};
      this.args = this.opts.args || ['main'];
      this.env = this.opts.env || ['LANG=ko_KR.UTF-8', 'HOME=/', 'PWD=/'];
      // 파일 시스템: 경로('a/b.txt', 앞의 / 없음) → { data: Uint8Array, size }
      this.files = new Map();
      this.dirs = new Set(['']);
      for (const [name, bytes] of Object.entries(this.opts.files || {})) {
        const p = this.norm(name);
        this.files.set(p, { data: new Uint8Array(bytes), size: bytes.length });
        this.mkdirs(p);
      }
      this.fds = [
        { kind: 'stdin' }, { kind: 'stdout' }, { kind: 'stderr' },
        { kind: 'dir', path: '', preopen: '/' }
      ];
      this.stdinBuf = new Uint8Array(0);
      this.stdinEof = false;
      this.memory = null;
      this.exitCode = null;
    }

    // ------------------------------------------------------------------ 경로
    norm(p) {
      const out = [];
      for (const part of String(p).replace(/\\/g, '/').split('/')) {
        if (!part || part === '.') continue;
        if (part === '..') out.pop(); else out.push(part);
      }
      return out.join('/');
    }
    mkdirs(p) {
      const parts = p.split('/');
      for (let i = 1; i < parts.length; i++) this.dirs.add(parts.slice(0, i).join('/'));
    }
    resolve(dirfd, pathPtr, pathLen) {
      const d = this.fds[dirfd];
      if (!d || d.kind !== 'dir') return null;
      const rel = this.str(pathPtr, pathLen);
      return this.norm((rel.startsWith('/') ? '' : d.path + '/') + rel);
    }

    // ------------------------------------------------------------------ 메모리
    get dv() { return new DataView(this.memory.buffer); }
    get u8() { return new Uint8Array(this.memory.buffer); }
    str(ptr, len) { return new TextDecoder().decode(this.u8.slice(ptr, ptr + len)); }

    /** 파일 목록/내용 스냅샷 (실행 뒤 작업 폴더) */
    snapshot() {
      const o = {};
      for (const [k, f] of this.files) o[k] = f.data.slice(0, f.size);
      return o;
    }

    start(instance) {
      this.memory = instance.exports.memory;
      try {
        instance.exports._start();
        this.exitCode = 0;
      } catch (e) {
        const ex = instance.exports;
        if (e && e.isExit) this.exitCode = e.code;
        else if (typeof WebAssembly.Exception === 'function' && e instanceof WebAssembly.Exception && ex.__cpp_exception && ex.__study_uncaught) {
          // 처리하지 않은 C++ 예외 → "terminating due to uncaught exception ..." 출력 후 비정상 종료
          try { ex.__study_uncaught(e.getArg(ex.__cpp_exception, 0)); } catch (e2) { /* 무시 */ }
          this.exitCode = 134;
        } else throw e;
      }
      return this.exitCode;
    }

    // ------------------------------------------------------------------ 표준 입력
    fillStdin() {
      if (this.stdinBuf.length || this.stdinEof) return;
      const chunk = this.opts.readStdin ? this.opts.readStdin() : null;
      if (chunk == null) this.stdinEof = true;
      else this.stdinBuf = chunk;
    }

    // ------------------------------------------------------------------ WASI 함수
    get imports() {
      const self = this;
      const fdOf = (fd) => self.fds[fd];
      const setStat = (ptr, ft, size) => {
        const dv = self.dv;
        for (let i = 0; i < 64; i += 8) dv.setBigUint64(ptr + i, 0n, true);
        dv.setBigUint64(ptr + 8, BigInt(1 + (size | 0) % 997), true);
        dv.setUint8(ptr + 16, ft);
        dv.setBigUint64(ptr + 24, 1n, true);
        dv.setBigUint64(ptr + 32, BigInt(size || 0), true);
        const now = BigInt(Date.now()) * 1000000n;
        dv.setBigUint64(ptr + 40, now, true); dv.setBigUint64(ptr + 48, now, true); dv.setBigUint64(ptr + 56, now, true);
      };
      const ensureCap = (f, need) => {
        if (need <= f.data.length) return;
        const n = new Uint8Array(Math.max(need, f.data.length * 2, 256));
        n.set(f.data.subarray(0, f.size));
        f.data = n;
      };
      const readFile = (h, iovs, iovsLen, pos) => {
        const f = self.files.get(h.path);
        if (!f) return [E.BADF, 0];
        const dv = self.dv; let n = 0;
        for (let i = 0; i < iovsLen; i++) {
          const buf = dv.getUint32(iovs + i * 8, true), len = dv.getUint32(iovs + i * 8 + 4, true);
          const avail = Math.max(0, Math.min(len, f.size - pos));
          self.u8.set(f.data.subarray(pos, pos + avail), buf);
          pos += avail; n += avail;
          if (avail < len) break;
        }
        return [0, n, pos];
      };
      const writeFile = (h, iovs, iovsLen, pos) => {
        const f = self.files.get(h.path);
        if (!f) return [E.BADF, 0];
        const dv = self.dv; let n = 0;
        for (let i = 0; i < iovsLen; i++) {
          const buf = dv.getUint32(iovs + i * 8, true), len = dv.getUint32(iovs + i * 8 + 4, true);
          ensureCap(f, pos + len);
          f.data.set(self.u8.subarray(buf, buf + len), pos);
          pos += len; n += len;
          if (pos > f.size) f.size = pos;
        }
        if (self.opts.onFileWrite) self.opts.onFileWrite(h.path, f.size);
        return [0, n, pos];
      };

      const w = {
        args_sizes_get(argc, bufSize) {
          const dv = self.dv;
          dv.setUint32(argc, self.args.length, true);
          dv.setUint32(bufSize, self.args.reduce((a, s) => a + new TextEncoder().encode(s).length + 1, 0), true);
          return 0;
        },
        args_get(argv, buf) { return w._strings(self.args, argv, buf); },
        environ_sizes_get(cnt, bufSize) {
          const dv = self.dv;
          dv.setUint32(cnt, self.env.length, true);
          dv.setUint32(bufSize, self.env.reduce((a, s) => a + new TextEncoder().encode(s).length + 1, 0), true);
          return 0;
        },
        environ_get(env, buf) { return w._strings(self.env, env, buf); },
        _strings(list, ptrs, buf) {
          const dv = self.dv, u8 = self.u8;
          for (const s of list) {
            dv.setUint32(ptrs, buf, true); ptrs += 4;
            const b = new TextEncoder().encode(s);
            u8.set(b, buf); u8[buf + b.length] = 0; buf += b.length + 1;
          }
          return 0;
        },
        clock_res_get(id, out) { self.dv.setBigUint64(out, 1000n, true); return 0; },
        clock_time_get(id, prec, out) {
          let ns;
          if (id === 0) ns = BigInt(Date.now()) * 1000000n + BigInt(Math.floor((performance.now() % 1) * 1e6));
          else ns = BigInt(Math.floor(performance.now() * 1e6));
          self.dv.setBigUint64(out, ns, true);
          return 0;
        },
        random_get(buf, len) {
          const b = new Uint8Array(len);
          for (let i = 0; i < len; i += 65536) crypto.getRandomValues(b.subarray(i, Math.min(len, i + 65536)));
          self.u8.set(b, buf);
          return 0;
        },
        proc_exit(code) { self.exitCode = code; throw new ExitError(code); },
        proc_raise() { return E.NOSYS; },
        sched_yield() { return 0; },

        fd_write(fd, iovs, iovsLen, nwritten) {
          const h = fdOf(fd);
          if (!h) return E.BADF;
          const dv = self.dv;
          if (h.kind === 'stdout' || h.kind === 'stderr') {
            let n = 0;
            for (let i = 0; i < iovsLen; i++) {
              const buf = dv.getUint32(iovs + i * 8, true), len = dv.getUint32(iovs + i * 8 + 4, true);
              if (len) self.opts.write && self.opts.write(fd, self.u8.slice(buf, buf + len));
              n += len;
            }
            self.dv.setUint32(nwritten, n, true);
            return 0;
          }
          if (h.kind !== 'file') return E.BADF;
          if (!h.write) return E.BADF;
          const f = self.files.get(h.path);
          const pos = h.append ? f.size : h.pos;
          const [err, n, np] = writeFile(h, iovs, iovsLen, pos);
          if (err) return err;
          h.pos = np;
          self.dv.setUint32(nwritten, n, true);
          return 0;
        },
        fd_pwrite(fd, iovs, iovsLen, offset, nwritten) {
          const h = fdOf(fd);
          if (!h || h.kind !== 'file') return E.BADF;
          const [err, n] = writeFile(h, iovs, iovsLen, Number(offset));
          if (err) return err;
          self.dv.setUint32(nwritten, n, true);
          return 0;
        },
        fd_read(fd, iovs, iovsLen, nread) {
          const h = fdOf(fd);
          if (!h) return E.BADF;
          if (h.kind === 'stdin') {
            self.fillStdin();
            const dv = self.dv; let n = 0;
            for (let i = 0; i < iovsLen && self.stdinBuf.length; i++) {
              const buf = dv.getUint32(iovs + i * 8, true), len = dv.getUint32(iovs + i * 8 + 4, true);
              const k = Math.min(len, self.stdinBuf.length);
              self.u8.set(self.stdinBuf.subarray(0, k), buf);
              self.stdinBuf = self.stdinBuf.subarray(k);
              n += k;
            }
            self.dv.setUint32(nread, n, true);
            return 0;
          }
          if (h.kind === 'dir') return E.ISDIR;
          if (h.kind !== 'file' || !h.read) return E.BADF;
          const [err, n, np] = readFile(h, iovs, iovsLen, h.pos);
          if (err) return err;
          h.pos = np;
          self.dv.setUint32(nread, n, true);
          return 0;
        },
        fd_pread(fd, iovs, iovsLen, offset, nread) {
          const h = fdOf(fd);
          if (!h || h.kind !== 'file') return E.BADF;
          const [err, n] = readFile(h, iovs, iovsLen, Number(offset));
          if (err) return err;
          self.dv.setUint32(nread, n, true);
          return 0;
        },
        fd_seek(fd, offset, whence, out) {
          const h = fdOf(fd);
          if (!h) return E.BADF;
          if (h.kind !== 'file') return E.SPIPE;
          const f = self.files.get(h.path);
          const base = whence === 0 ? 0 : whence === 1 ? h.pos : f.size;
          const np = base + Number(offset);
          if (np < 0) return E.INVAL;
          h.pos = np;
          self.dv.setBigUint64(out, BigInt(np), true);
          return 0;
        },
        fd_tell(fd, out) {
          const h = fdOf(fd);
          if (!h || h.kind !== 'file') return E.BADF;
          self.dv.setBigUint64(out, BigInt(h.pos), true);
          return 0;
        },
        fd_close(fd) {
          const h = fdOf(fd);
          if (!h || fd < 4) return h ? 0 : E.BADF;
          self.fds[fd] = undefined;
          if (h.kind === 'file' && h.write && self.opts.onFileClose) {
            const f = self.files.get(h.path);
            if (f) self.opts.onFileClose(h.path, f.data.slice(0, f.size));
          }
          return 0;
        },
        fd_sync() { return 0; }, fd_datasync() { return 0; }, fd_advise() { return 0; }, fd_allocate() { return 0; },
        fd_fdstat_get(fd, out) {
          const h = fdOf(fd);
          if (!h) return E.BADF;
          const dv = self.dv;
          const ft = h.kind === 'dir' ? FT.DIR : h.kind === 'file' ? FT.FILE : FT.CHAR;
          dv.setUint8(out, ft);
          dv.setUint16(out + 2, h.append ? 1 : 0, true);
          dv.setBigUint64(out + 8, 0xFFFFFFFFn, true);
          dv.setBigUint64(out + 16, 0xFFFFFFFFn, true);
          return 0;
        },
        fd_fdstat_set_flags() { return 0; },
        fd_fdstat_set_rights() { return 0; },
        fd_filestat_get(fd, out) {
          const h = fdOf(fd);
          if (!h) return E.BADF;
          if (h.kind === 'file') setStat(out, FT.FILE, self.files.get(h.path).size);
          else if (h.kind === 'dir') setStat(out, FT.DIR, 0);
          else setStat(out, FT.CHAR, 0);
          return 0;
        },
        fd_filestat_set_size(fd, size) {
          const h = fdOf(fd);
          if (!h || h.kind !== 'file') return E.BADF;
          const f = self.files.get(h.path);
          const n = Number(size);
          ensureCap(f, n);
          if (n > f.size) f.data.fill(0, f.size, n);
          f.size = n;
          return 0;
        },
        fd_filestat_set_times() { return 0; },
        fd_prestat_get(fd, out) {
          const h = fdOf(fd);
          if (!h || !h.preopen) return E.BADF;
          self.dv.setUint8(out, 0);
          self.dv.setUint32(out + 4, new TextEncoder().encode(h.preopen).length, true);
          return 0;
        },
        fd_prestat_dir_name(fd, ptr, len) {
          const h = fdOf(fd);
          if (!h || !h.preopen) return E.BADF;
          self.u8.set(new TextEncoder().encode(h.preopen).subarray(0, len), ptr);
          return 0;
        },
        fd_readdir(fd, buf, bufLen, cookie, used) {
          const h = fdOf(fd);
          if (!h || h.kind !== 'dir') return E.BADF;
          const pre = h.path ? h.path + '/' : '';
          const names = new Set();
          for (const k of [...self.files.keys(), ...self.dirs]) {
            if (!k || !k.startsWith(pre)) continue;
            const rest = k.slice(pre.length);
            if (rest) names.add(rest.split('/')[0]);
          }
          const list = ['.', '..', ...[...names].sort()];
          const dv = self.dv; let off = 0;
          for (let i = Number(cookie); i < list.length; i++) {
            const nm = new TextEncoder().encode(list[i]);
            const full = pre + list[i];
            const type = (list[i] === '.' || list[i] === '..' || self.dirs.has(full)) ? FT.DIR : FT.FILE;
            const ent = new Uint8Array(24 + nm.length);
            const edv = new DataView(ent.buffer);
            edv.setBigUint64(0, BigInt(i + 1), true);
            edv.setBigUint64(8, BigInt(i + 1), true);
            edv.setUint32(16, nm.length, true);
            edv.setUint8(20, type);
            ent.set(nm, 24);
            const k = Math.min(ent.length, bufLen - off);
            self.u8.set(ent.subarray(0, k), buf + off);
            off += k;
            if (off >= bufLen) break;
          }
          dv.setUint32(used, off, true);
          return 0;
        },
        fd_renumber(from, to) {
          if (!fdOf(from)) return E.BADF;
          self.fds[to] = self.fds[from];
          self.fds[from] = undefined;
          return 0;
        },
        path_open(dirfd, dirflags, pathPtr, pathLen, oflags, rightsBase, rightsInh, fdflags, out) {
          const p = self.resolve(dirfd, pathPtr, pathLen);
          if (p == null) return E.BADF;
          const isDir = self.dirs.has(p);
          const exists = self.files.has(p);
          if (oflags & 2) { // DIRECTORY
            if (!isDir) return exists ? E.NOTDIR : E.NOENT;
          }
          if (isDir) {
            const fd = self.fds.length;
            self.fds.push({ kind: 'dir', path: p });
            self.dv.setUint32(out, fd, true);
            return 0;
          }
          if (!exists) {
            if (!(oflags & 1)) return E.NOENT;
            const parent = p.split('/').slice(0, -1).join('/');
            if (!self.dirs.has(parent)) return E.NOENT;
            self.files.set(p, { data: new Uint8Array(0), size: 0 });
          } else if ((oflags & 1) && (oflags & 4)) return E.EXIST;
          const rb = BigInt(rightsBase);
          const write = (rb & (1n << 6n)) !== 0n || (fdflags & 1) !== 0; // FD_WRITE
          const read = (rb & (1n << 1n)) !== 0n || !write;                // FD_READ
          const f = self.files.get(p);
          if (oflags & 8) f.size = 0; // TRUNC
          const fd = self.fds.length;
          self.fds.push({ kind: 'file', path: p, pos: 0, read, write, append: (fdflags & 1) !== 0 });
          self.dv.setUint32(out, fd, true);
          return 0;
        },
        path_filestat_get(dirfd, flags, pathPtr, pathLen, out) {
          const p = self.resolve(dirfd, pathPtr, pathLen);
          if (p == null) return E.BADF;
          if (self.dirs.has(p)) { setStat(out, FT.DIR, 0); return 0; }
          const f = self.files.get(p);
          if (!f) return E.NOENT;
          setStat(out, FT.FILE, f.size);
          return 0;
        },
        path_filestat_set_times() { return 0; },
        path_create_directory(dirfd, pathPtr, pathLen) {
          const p = self.resolve(dirfd, pathPtr, pathLen);
          if (p == null) return E.BADF;
          if (self.dirs.has(p) || self.files.has(p)) return E.EXIST;
          self.dirs.add(p); self.mkdirs(p);
          return 0;
        },
        path_remove_directory(dirfd, pathPtr, pathLen) {
          const p = self.resolve(dirfd, pathPtr, pathLen);
          if (!self.dirs.has(p)) return E.NOENT;
          for (const k of [...self.files.keys(), ...self.dirs]) if (k !== p && k.startsWith(p + '/')) return E.NOTEMPTY;
          self.dirs.delete(p);
          return 0;
        },
        path_unlink_file(dirfd, pathPtr, pathLen) {
          const p = self.resolve(dirfd, pathPtr, pathLen);
          if (self.dirs.has(p)) return E.ISDIR;
          if (!self.files.delete(p)) return E.NOENT;
          return 0;
        },
        path_rename(fd1, p1, l1, fd2, p2, l2) {
          const a = self.resolve(fd1, p1, l1), b = self.resolve(fd2, p2, l2);
          const f = self.files.get(a);
          if (!f) return E.NOENT;
          self.files.delete(a); self.files.set(b, f);
          self.fds.forEach((h) => { if (h && h.path === a) h.path = b; });
          return 0;
        },
        path_readlink() { return E.INVAL; }, path_symlink() { return E.PERM; }, path_link() { return E.PERM; },
        poll_oneoff(inPtr, outPtr, nsubs, nevents) {
          const dv = self.dv; let wait = 0, n = 0;
          for (let i = 0; i < nsubs; i++) {
            const s = inPtr + i * 48;
            const tag = dv.getUint8(s + 8);
            if (tag === 0) {
              const timeout = Number(dv.getBigUint64(s + 24, true)) / 1e6;
              const abs = dv.getUint16(s + 40, true) & 1;
              wait = Math.max(wait, abs ? timeout - Date.now() : timeout);
            }
            const e = outPtr + n * 32;
            dv.setBigUint64(e, dv.getBigUint64(s, true), true);
            dv.setUint16(e + 8, 0, true);
            dv.setUint8(e + 10, tag);
            n++;
          }
          if (wait > 0) {
            wait = Math.min(wait, 10000);
            if (self.opts.sleep) self.opts.sleep(wait);
            else { const t = Date.now() + wait; while (Date.now() < t) { /* 대기 */ } }
          }
          dv.setUint32(nevents, n, true);
          return 0;
        },
        sock_accept() { return E.NOSYS; }, sock_recv() { return E.NOSYS; }, sock_send() { return E.NOSYS; }, sock_shutdown() { return E.NOSYS; }
      };
      return new Proxy(w, { get: (t, k) => (k in t ? t[k] : () => E.NOSYS) });
    }
  }

  WasiRuntime.ExitError = ExitError;
  root.WasiRuntime = WasiRuntime;
  if (typeof module === 'object' && module.exports) module.exports = WasiRuntime;
})(typeof self !== 'undefined' ? self : globalThis);
