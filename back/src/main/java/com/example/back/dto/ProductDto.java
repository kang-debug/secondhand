package com.example.back.dto;

import com.example.back.entity.Product;
import lombok.Getter;

@Getter
public class ProductDto {
    private Long productId;
    private String name;
    private Long currentPrice;
    private String imageUrl; // 첫 번째 이미지 URL
    private String uploadedBy;

    public ProductDto(Product product) {
        this.productId = product.getProductId();
        this.name = product.getName();
        this.currentPrice = product.getCurrentPrice();
        this.imageUrl = product.getImageUrls().isEmpty() ? null : product.getImageUrls().get(0);
        this.uploadedBy = product.getMember().getNickname();
    }
}
