// 브리지 API 점검: 각 함수를 불러 결과 요약을 출력한다 (node tools/try.mjs tools/tests/api.cpp)
#include <opencv2/opencv.hpp>
#include <iostream>
#include <functional>
using namespace cv;
using namespace std;

static int fails = 0;
static void T(const char* name, const function<void()>& f) {
    try { f(); }
    catch (const cv::Exception& e) { fails++; cout << "FAIL " << name << ": " << e.what(); }
    catch (const std::exception& e) { fails++; cout << "FAIL " << name << ": " << e.what() << endl; }
}

int main() {
    Mat img = imread("images/sample_color.png");
    Mat gray; cvtColor(img, gray, COLOR_BGR2GRAY);
    Mat bin; threshold(gray, bin, 128, 255, THRESH_BINARY);
    Mat coins = imread("images/coins_parts.png", IMREAD_GRAYSCALE);

    T("arith", [&] {
        Mat a = img + Scalar(10, 20, 30); Mat b = img - img; Mat c = img * 0.5; Mat d = img / 2; Mat e = ~bin; Mat f = bin & bin; Mat g = gray > 100;
        Mat h; add(gray, 50, h); Mat i; subtract(Scalar(255), gray, i); Mat j; multiply(gray, gray, j, 1.0 / 255); Mat k; divide(gray, 2, k);
        Mat l; absdiff(gray, Scalar(128), l); Mat m; addWeighted(img, 0.7, img, 0.3, 0, m); Mat n; compare(gray, 128, n, CMP_GE);
        Mat o; inRange(img, Scalar(0, 0, 0), Scalar(100, 100, 100), o); Mat p = cv::abs(gray - 128);
        cout << "arith " << a.at<Vec3b>(0, 0) << " " << sum(b)[0] << " " << (int)c.at<Vec3b>(5, 5)[0] << " " << countNonZero(e) + countNonZero(g) << " " << (int)h.at<uchar>(0, 0)
             << " " << (int)i.at<uchar>(0, 0) << " " << countNonZero(o) << " " << countNonZero(n) << " " << mean(p)[0] << endl;
    });
    T("stats", [&] {
        double mn, mx; Point pmn, pmx; minMaxLoc(gray, &mn, &mx, &pmn, &pmx);
        Scalar mu, sd; meanStdDev(gray, mu, sd);
        cout << "stats " << mn << " " << mx << " " << pmn << " " << pmx << " " << mu[0] << " " << sd[0] << " " << norm(gray) << " " << norm(gray, gray) << endl;
    });
    T("split/merge", [&] {
        vector<Mat> ch; split(img, ch); Mat m; merge(ch, m); Mat arr[3]; split(img, arr);
        cout << "split " << ch.size() << " " << ch[0].type() << " " << norm(m, img) << " " << arr[2].size() << endl;
    });
    T("geom", [&] {
        Mat f; flip(img, f, 1); Mat r; rotate(img, r, ROTATE_90_CLOCKWISE); Mat t = gray.t(); Mat hc; hconcat(gray, gray, hc); Mat vc; vconcat(gray, gray, vc);
        Mat b; copyMakeBorder(gray, b, 5, 5, 5, 5, BORDER_CONSTANT, Scalar(0));
        Mat M = getRotationMatrix2D(Point2f(320, 240), 30, 1.0); Mat w; warpAffine(img, w, M, img.size());
        Point2f s[4] = { {0, 0}, {639, 0}, {639, 479}, {0, 479} }, d[4] = { {10, 10}, {600, 30}, {630, 470}, {5, 450} };
        Mat P = getPerspectiveTransform(s, d); Mat wp; warpPerspective(img, wp, P, Size(640, 480));
        Mat A = getAffineTransform(s, d);
        cout << "geom " << f.size() << r.size() << t.size() << hc.size() << vc.size() << b.size() << " " << M.at<double>(0, 0) << " " << P.type() << " " << A.size() << " " << wp.size() << endl;
        cout << M << endl;
    });
    T("filters", [&] {
        Mat a, b, c, d, e, f, g, h, k;
        blur(gray, a, Size(5, 5)); GaussianBlur(gray, b, Size(5, 5), 0); medianBlur(gray, c, 5); bilateralFilter(img, d, 9, 75, 75);
        Mat ker = (Mat_<float>(3, 3) << 0, -1, 0, -1, 5, -1, 0, -1, 0); filter2D(gray, e, -1, ker);
        Sobel(gray, f, CV_16S, 1, 0); Laplacian(gray, g, CV_16S); Canny(gray, h, 50, 150); boxFilter(gray, k, -1, Size(3, 3));
        Mat sc; convertScaleAbs(f, sc); Mat sch; Scharr(gray, sch, CV_32F, 0, 1);
        cout << "filters " << (int)a.at<uchar>(100, 100) << " " << (int)b.at<uchar>(100, 100) << " " << countNonZero(h) << " " << f.type() << " " << sc.type() << " " << sch.type() << endl;
    });
    T("morph", [&] {
        Mat k = getStructuringElement(MORPH_ELLIPSE, Size(5, 5));
        Mat a, b, c; erode(bin, a, k); dilate(bin, b, Mat(), Point(-1, -1), 2); morphologyEx(bin, c, MORPH_OPEN, k);
        cout << "morph " << k.size() << " " << countNonZero(a) << " " << countNonZero(b) << " " << countNonZero(c) << endl << k << endl;
    });
    T("resize/pyr", [&] {
        Mat a, b, c; resize(img, a, Size(320, 240), 0, 0, INTER_AREA); pyrDown(img, b); pyrUp(b, c);
        cout << "resize " << a.size() << b.size() << c.size() << endl;
    });
    T("hist", [&] {
        Mat hist; int histSize = 256; float range[] = { 0, 256 }; const float* ranges[] = { range }; int ch0 = 0;
        calcHist(&gray, 1, &ch0, Mat(), hist, 1, &histSize, ranges);
        Mat eq; equalizeHist(gray, eq);
        Ptr<CLAHE> cl = createCLAHE(2.0, Size(8, 8)); Mat c; cl->apply(gray, c);
        Mat h2; calcHist(vector<Mat>{ gray }, { 0 }, Mat(), h2, { 32 }, { 0, 256 });
        cout << "hist " << hist.size() << " " << hist.type() << " " << sum(hist)[0] << " " << h2.size() << " " << compareHist(hist, hist, HISTCMP_CORREL) << " " << c.type() << endl;
    });
    T("adaptive", [&] { Mat a; adaptiveThreshold(gray, a, 255, ADAPTIVE_THRESH_GAUSSIAN_C, THRESH_BINARY, 11, 2); cout << "adaptive " << countNonZero(a) << endl; });
    T("contours", [&] {
        Mat b; threshold(coins, b, 0, 255, THRESH_BINARY | THRESH_OTSU);
        vector<vector<Point>> cs; vector<Vec4i> hi; findContours(b, cs, hi, RETR_TREE, CHAIN_APPROX_SIMPLE);
        cout << "contours " << cs.size() << " " << hi.size();
        if (!cs.empty()) {
            auto& c = cs[0];
            vector<Point> ap; approxPolyDP(c, ap, 0.02 * arcLength(c, true), true);
            RotatedRect rr = minAreaRect(c); Point2f cc; float rad; minEnclosingCircle(c, cc, rad);
            vector<Point> hull; convexHull(c, hull); vector<int> hidx; convexHull(c, hidx);
            Moments m = moments(c); double hu[7]; HuMoments(m, hu);
            cout << " area " << contourArea(c) << " ap " << ap.size() << " rr " << rr.size << " circ " << cc << " " << rad << " hull " << hull.size() << "/" << hidx.size()
                 << " m00 " << m.m00 << " convex " << isContourConvex(hull) << " ppt " << pointPolygonTest(c, Point2f(cc), false);
            if (c.size() >= 5) { RotatedRect el = fitEllipse(c); cout << " el " << el.center; }
            Vec4f line; fitLine(c, line, DIST_L2, 0, 0.01, 0.01); cout << " line " << line[0];
            if (hidx.size() > 3) { vector<Vec4i> def; convexityDefects(c, hidx, def); cout << " def " << def.size(); }
        }
        cout << endl;
        Mat draw = Mat::zeros(b.size(), CV_8UC3); drawContours(draw, cs, -1, Scalar(0, 255, 0), 2);
        cout << "drawn " << countNonZero(draw.reshape(1)) << endl;
    });
    T("cc", [&] {
        Mat b; threshold(coins, b, 0, 255, THRESH_BINARY | THRESH_OTSU);
        Mat lab, st, cen; int n = connectedComponentsWithStats(b, lab, st, cen);
        Mat l2; int n2 = connectedComponents(b, l2);
        cout << "cc " << n << " " << n2 << " " << st.size() << " " << st.type() << " " << cen.type() << " area1 " << (n > 1 ? st.at<int>(1, CC_STAT_AREA) : 0) << endl;
        Mat dt; distanceTransform(b, dt, DIST_L2, 3); double mx; minMaxLoc(dt, nullptr, &mx); cout << "dist " << mx << endl;
    });
    T("hough", [&] {
        Mat e; Canny(gray, e, 50, 150);
        vector<Vec2f> L; HoughLines(e, L, 1, CV_PI / 180, 150); vector<Vec4i> LP; HoughLinesP(e, LP, 1, CV_PI / 180, 50, 30, 10);
        Mat bl; medianBlur(coins, bl, 5); vector<Vec3f> C; HoughCircles(bl, C, HOUGH_GRADIENT, 1, 20, 100, 30, 5, 100);
        cout << "hough " << L.size() << " " << LP.size() << " " << C.size() << endl;
    });
    T("template", [&] {
        Mat t = gray(Rect(100, 100, 50, 40)).clone(); Mat r; matchTemplate(gray, t, r, TM_CCOEFF_NORMED);
        double mx; Point loc; minMaxLoc(r, nullptr, &mx, nullptr, &loc); cout << "template " << r.size() << " " << mx << " " << loc << endl;
    });
    T("drawing", [&] {
        Mat c = Mat::zeros(200, 300, CV_8UC3);
        line(c, Point(0, 0), Point(299, 199), Scalar(255, 0, 0), 2); circle(c, Point(150, 100), 40, Scalar(0, 0, 255), FILLED);
        ellipse(c, Point(150, 100), Size(80, 30), 30, 0, 360, Scalar(0, 255, 0), 1); rectangle(c, Point(10, 10), Point(60, 50), Scalar(255, 255, 0), -1);
        putText(c, "OpenCV", Point(20, 180), FONT_HERSHEY_SIMPLEX, 1.0, Scalar(255, 255, 255), 2);
        vector<Point> poly{ {200, 20}, {280, 40}, {250, 90} }; fillPoly(c, vector<vector<Point>>{ poly }, Scalar(0, 128, 255)); polylines(c, poly, true, Scalar(255, 255, 255));
        arrowedLine(c, Point(10, 100), Point(100, 100), Scalar(0, 255, 255)); drawMarker(c, Point(250, 150), Scalar(255, 0, 255));
        int base = 0; Size ts = getTextSize("OpenCV", FONT_HERSHEY_SIMPLEX, 1.0, 2, &base);
        Mat roi = c(Rect(100, 50, 100, 100)); circle(roi, Point(50, 50), 10, Scalar(1, 2, 3), -1);
        cout << "drawing " << countNonZero(c.reshape(1)) << " text " << ts << " base " << base << " roi " << c.at<Vec3b>(100, 150) << endl;
    });
    T("features", [&] {
        Ptr<ORB> orb = ORB::create(300); vector<KeyPoint> kp; Mat des; orb->detectAndCompute(gray, noArray(), kp, des);
        Mat g2; resize(gray, g2, Size(), 0.9, 0.9); vector<KeyPoint> kp2; Mat des2; orb->detectAndCompute(g2, Mat(), kp2, des2);
        BFMatcher bf(NORM_HAMMING, true); vector<DMatch> ms; bf.match(des, des2, ms);
        auto knn = BFMatcher::create(NORM_HAMMING); vector<vector<DMatch>> km; knn->knnMatch(des, des2, km, 2);
        Mat out; drawMatches(gray, kp, g2, kp2, ms, out); Mat ko; drawKeypoints(gray, kp, ko, Scalar(0, 255, 0));
        cout << "orb " << kp.size() << " " << des.size() << " " << des.type() << " matches " << ms.size() << " knn " << km.size() << (km.empty() ? 0 : km[0].size()) << " out " << out.size() << " " << ko.type() << " kp0 " << kp[0].pt << " " << kp[0].size << endl;
        vector<Point2f> a, b; for (auto& m : ms) { a.push_back(kp[m.queryIdx].pt); b.push_back(kp2[m.trainIdx].pt); }
        Mat mask; Mat H = findHomography(a, b, RANSAC, 3, mask);
        vector<Point2f> src{ {0, 0}, {100, 0} }, dst; if (!H.empty()) perspectiveTransform(src, dst, H);
        cout << "homography " << H.size() << " " << (H.empty() ? 0 : H.at<double>(0, 0)) << " inl " << countNonZero(mask) << " " << dst.size() << endl;
        vector<Point2f> corners; goodFeaturesToTrack(gray, corners, 50, 0.01, 10); cout << "gftt " << corners.size() << endl;
        vector<KeyPoint> fk; FastFeatureDetector::create(30)->detect(gray, fk); cout << "fast " << fk.size() << endl;
    });
    T("video", [&] {
        VideoCapture cap(0); Mat f; int n = 0; Ptr<BackgroundSubtractorMOG2> bs = createBackgroundSubtractorMOG2(); Mat fg;
        cout << "cap " << cap.isOpened() << " " << cap.get(CAP_PROP_FRAME_WIDTH) << "x" << cap.get(CAP_PROP_FRAME_HEIGHT) << endl;
        Mat prev; vector<Point2f> p0;
        while (cap.read(f) && n < 5) {
            n++; bs->apply(f, fg);
            Mat g; cvtColor(f, g, COLOR_BGR2GRAY);
            if (!prev.empty()) { vector<Point2f> p1; vector<uchar> st; vector<float> er; if (p0.empty()) goodFeaturesToTrack(prev, p0, 30, 0.01, 10); if (!p0.empty()) calcOpticalFlowPyrLK(prev, g, p0, p1, st, er); cout << " lk " << p1.size(); }
            prev = g;
        }
        cout << " frames " << n << " fg " << fg.type() << endl;
    });
    T("qr/misc", [&] {
        QRCodeDetector q; string s = q.detectAndDecode(img); cout << "qr '" << s << "'" << endl;
        Mat data(20, 2, CV_32F); randu(data, 0, 100); Mat labels, centers; double comp = kmeans(data, 3, labels, TermCriteria(TermCriteria::EPS + TermCriteria::COUNT, 10, 1.0), 3, KMEANS_PP_CENTERS, centers);
        cout << "kmeans " << labels.size() << " " << centers.size() << " " << (comp > 0) << endl;
        Mat lut(1, 256, CV_8U); for (int i = 0; i < 256; i++) lut.at<uchar>(i) = 255 - i; Mat inv; LUT(gray, lut, inv); cout << "lut " << (int)inv.at<uchar>(0, 0) + (int)gray.at<uchar>(0, 0) << endl;
        Mat cm; applyColorMap(gray, cm, COLORMAP_JET); cout << "colormap " << cm.type() << endl;
        Mat nrm; normalize(gray, nrm, 0, 1, NORM_MINMAX, CV_32F); cout << "normalize " << nrm.type() << endl;
        Mat ig; integral(gray, ig); cout << "integral " << ig.size() << " " << ig.type() << endl;
        Mat fl; gray.convertTo(fl, CV_32F); Mat dftm; dft(fl, dftm, DFT_COMPLEX_OUTPUT); cout << "dft " << dftm.type() << endl;
        Mat A = (Mat_<double>(2, 2) << 4, 7, 2, 6); cout << "inv " << A.inv() << " det " << determinant(A) << endl << A * A.inv() << endl;
        imwrite("out.png", img); Mat back = imread("out.png"); cout << "imwrite " << back.size() << " " << norm(back, img) << endl;
        Mat fm = Mat::zeros(coins.size(), CV_8UC1); floodFill(fm, Point(5, 5), Scalar(200)); cout << "flood " << countNonZero(fm) << endl;
        vector<Point> nz; findNonZero(bin, nz); cout << "nonzero " << nz.size() << endl;
        Mat big = imread("images/nothing.png"); cout << "empty " << big.empty() << endl;
    });
    cout << "fails " << fails << endl;
    return 0;
}
