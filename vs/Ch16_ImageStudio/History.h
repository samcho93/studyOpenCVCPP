#pragma once
#include <opencv2/opencv.hpp>
#include <deque>
#include <string>
#include <vector>

// 되돌리기 · 다시 실행: 이미지 스냅숏(+ 이름)을 스택 두 개로 관리한다
class History
{
public:
    explicit History(size_t maxDepth = 20) : maxDepth_(maxDepth) {}

    void reset(const cv::Mat& img, const std::string& label)
    {
        undo_.clear();
        redo_.clear();
        current_ = { img.clone(), label };             // clone: History 가 자기 데이터를 가진다
    }

    void push(const cv::Mat& img, const std::string& label)
    {
        undo_.push_back(current_);
        if (undo_.size() > maxDepth_) undo_.pop_front(); // 가장 오래된 기록을 버린다 (메모리 제한)
        current_ = { img.clone(), label };
        redo_.clear();                                   // 새 작업을 하면 "미래" 는 사라진다
    }

    bool undo()
    {
        if (undo_.empty()) return false;
        redo_.push_back(current_);
        current_ = undo_.back();
        undo_.pop_back();
        return true;
    }

    bool redo()
    {
        if (redo_.empty()) return false;
        undo_.push_back(current_);
        current_ = redo_.back();
        redo_.pop_back();
        return true;
    }

    const cv::Mat& current() const { return current_.image; }
    const std::string& label() const { return current_.label; }
    size_t undoCount() const { return undo_.size(); }
    size_t redoCount() const { return redo_.size(); }

    std::vector<std::string> labels() const              // 오래된 것부터 현재까지
    {
        std::vector<std::string> v;
        for (const auto& s : undo_) v.push_back(s.label);
        v.push_back(current_.label);
        return v;
    }

private:
    struct Snapshot { cv::Mat image; std::string label; };
    std::deque<Snapshot> undo_;
    std::vector<Snapshot> redo_;
    Snapshot current_;
    size_t maxDepth_;
};
