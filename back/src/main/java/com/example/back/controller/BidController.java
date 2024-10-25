package com.example.back.controller;

import com.example.back.entity.Bid;
import com.example.back.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;


@RestController
@RequestMapping("/api/bids")
@CrossOrigin(origins = "*")
public class BidController {

    @Autowired
    private BidService bidService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/{productId}/{memberId}")
    public Bid placeBid(
            @PathVariable Long productId,
            @PathVariable Long memberId,
            @RequestParam Long bidAmount) {
        Bid bid = bidService.placeBid(productId, memberId, bidAmount);

        messagingTemplate.convertAndSend("/topic/bid-updates", bid);

        messagingTemplate.convertAndSend("/topic/bid-history/" + productId, "입찰가가 갱신되었습니다.");

        return bid;
    }
}