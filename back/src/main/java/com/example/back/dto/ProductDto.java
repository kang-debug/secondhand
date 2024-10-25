package com.example.back.dto;

import com.example.back.entity.Product;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductDto {
    private Long productId;
    private String name;
    private Long currentPrice;
    private String imageUrl;
    private String uploadedBy;
    private String auctionEndTime;
    private String highestBidder;

    public ProductDto(Product product) {
        this.productId = product.getProductId();
        this.name = product.getName();
        this.currentPrice = product.getCurrentPrice();
        this.imageUrl = product.getImageUrls().isEmpty() ? null : product.getImageUrls().get(0);
        this.uploadedBy = product.getMember().getNickname();
        this.auctionEndTime = product.getAuctionEndTime().toString();
        this.highestBidder = product.getHighestBidder() != null ? product.getHighestBidder().getNickname() : null;
    }
}
