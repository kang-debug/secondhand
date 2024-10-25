package com.example.back.repository;

import com.example.back.entity.BidHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidHistoryRepository extends JpaRepository<BidHistory, Long> {
    List<BidHistory> findByMember_MemberId(Long memberId);
    List<BidHistory> findByProduct_ProductId(Long productId);

}