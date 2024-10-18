package com.example.back.repository;

import com.example.back.entity.Bid;
import com.example.back.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByProductOrderByBidTimeDesc(Product product);
}
