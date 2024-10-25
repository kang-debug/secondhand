// src/main/java/com/example/back/service/BidService.java
package com.example.back.service;

import com.example.back.entity.Bid;
import com.example.back.entity.Product;
import com.example.back.entity.Member;
import com.example.back.repository.BidRepository;
import com.example.back.repository.ProductRepository;
import com.example.back.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BidService {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Transactional
    public Bid placeBid(Long productId, Long memberId, Long bidAmount) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid product ID"));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid member ID"));

        if (bidAmount <= product.getCurrentPrice()) {
            throw new IllegalArgumentException("Bid amount must be higher than the current price.");
        }

        product.setCurrentPrice(bidAmount);
        productRepository.save(product);

        Bid bid = new Bid();
        bid.setProduct(product);
        bid.setMember(member);
        bid.setBidAmount(bidAmount);
        return bidRepository.save(bid);
    }
}
