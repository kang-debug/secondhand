package com.example.back.controller;

import com.example.back.entity.Bid;
import com.example.back.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bids")
public class BidController {

    @Autowired
    private BidService bidService;

    @PostMapping("/{productId}/{memberId}")
    public Bid placeBid(
            @PathVariable Long productId,
            @PathVariable Long memberId,
            @RequestParam Long bidAmount) {
        return bidService.placeBid(productId, memberId, bidAmount);
    }
}
