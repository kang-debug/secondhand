package com.example.back.repository;

import com.example.back.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByAuctionEndTimeAfter(LocalDateTime currentDateTime);
    List<Product> findByMember_MemberId(Long memberId);
}
