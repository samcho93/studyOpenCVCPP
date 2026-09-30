#pragma once
#include "Filter.h"
#include <vector>

// 필터를 순서대로 담아 한 번에 실행한다. 필터 객체의 주인(owner) = Pipeline
class Pipeline
{
public:
    void add(std::unique_ptr<Filter> f) { filters_.push_back(std::move(f)); }

    std::unique_ptr<Filter> popBack()          // 마지막 필터를 꺼내 소유권을 돌려준다
    {
        if (filters_.empty()) return nullptr;
        std::unique_ptr<Filter> f = std::move(filters_.back());
        filters_.pop_back();
        return f;
    }

    void clear() { filters_.clear(); }
    size_t size() const { return filters_.size(); }

    cv::Mat run(const cv::Mat& src) const
    {
        if (filters_.empty()) return src.clone();   // 필터가 없어도 "새 Mat" 약속을 지킨다
        cv::Mat cur = src;
        for (const auto& f : filters_)
            cur = f->apply(cur);
        return cur;
    }

    std::string describe() const
    {
        if (filters_.empty()) return "(none)";
        std::string s;
        for (size_t i = 0; i < filters_.size(); i++)
            s += (i ? " -> " : "") + filters_[i]->name();
        return s;
    }

private:
    std::vector<std::unique_ptr<Filter>> filters_;
};
