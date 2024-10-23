package com.example.back.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Getter
@Setter
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne
    @JoinColumn(name = "highest_bidder_id")
    private Member highestBidder; // 최고 입찰자 정보

    @Column(name = "image_url")
    private String imageUrl;

    @ElementCollection
    private List<String> imageUrls = new ArrayList<>();

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Long startingPrice; // 경매 시작 가격

    @Column(nullable = false)
    private Long currentPrice; // 현재 입찰 가격

    @Column(nullable = false)
    private LocalDateTime registrationDate = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime auctionEndTime;


}
