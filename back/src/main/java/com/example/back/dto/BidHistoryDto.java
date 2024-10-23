package com.example.back.dto;


import com.example.back.entity.BidHistory;
import com.example.back.entity.Product;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BidHistoryDto {
    private Long bidId;
    private Long bidPrice;
    private LocalDateTime bidTime;
    private ProductDto product;

    public BidHistoryDto(BidHistory bidHistory, Product product) {
        this.bidId = bidHistory.getBidId();
        this.bidPrice = bidHistory.getBidPrice();
        this.bidTime = bidHistory.getBidTime();
        this.product = new ProductDto(product);
    }
}
