package com.example.back.service;

import com.example.back.dto.BidHistoryDto;
import com.example.back.entity.BidHistory;
import com.example.back.entity.Member;
import com.example.back.entity.Product;
import com.example.back.repository.BidHistoryRepository;
import com.example.back.repository.MemberRepository;
import com.example.back.repository.ProductRepository;
import com.example.back.dto.ProductDto;

import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private GCSService gcsService;

    @Autowired
    private BidHistoryRepository bidHistoryRepository;


    public void createProduct(Long memberId, String name, String description, Long startingPrice, List<MultipartFile> images) throws IOException {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Product product = new Product();
        product.setMember(member);
        product.setName(name);
        product.setDescription(description);
        product.setStartingPrice(startingPrice);
        product.setCurrentPrice(startingPrice);
        product.setAuctionEndTime(LocalDateTime.now().plusDays(1));

        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile image : images) {
            String imageUrl = gcsService.uploadFile(image);
            imageUrls.add(imageUrl);
        }

        product.setImageUrls(imageUrls);
        product.setImageUrl(imageUrls.get(0));
        productRepository.save(product);
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductDto::new)
                .collect(Collectors.toList());
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
    }

    public List<Long> updateCurrentPrice(Long productId, Long newBidPrice, Long bidderId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (newBidPrice > product.getCurrentPrice()) {
            Member highestBidder = memberRepository.findById(bidderId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

            product.setCurrentPrice(newBidPrice);
            product.setHighestBidder(highestBidder);

            BidHistory bidHistory = new BidHistory();
            bidHistory.setMember(highestBidder);
            bidHistory.setProduct(product);
            bidHistory.setBidPrice(newBidPrice);
            bidHistoryRepository.save(bidHistory);

            productRepository.save(product);

            return bidHistoryRepository.findByProduct_ProductId(productId)
                    .stream()
                    .map(bid -> bid.getMember().getMemberId())
                    .distinct()
                    .collect(Collectors.toList());
        } else {
            throw new IllegalArgumentException("새로운 입찰가는 현재 입찰가보다 높아야 합니다.");
        }
    }

    public List<ProductDto> getProductsByMember(Long memberId) {
        List<Product> products = productRepository.findByMember_MemberId(memberId);
        return products.stream().map(ProductDto::new).collect(Collectors.toList());
    }

    public List<BidHistoryDto> getBidHistoryByMemberId(Long memberId) {
        List<BidHistory> bidHistories = bidHistoryRepository.findByMember_MemberId(memberId);

        return bidHistories.stream().map(bid -> {
            Product product = bid.getProduct();
            return new BidHistoryDto(bid, product);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (product.getAuctionEndTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("경매가 종료되지 않았습니다. 경매 종료 후에만 상품을 삭제할 수 있습니다.");
        }


        List<BidHistory> bidHistories = bidHistoryRepository.findByProduct_ProductId(productId);
        bidHistoryRepository.deleteAll(bidHistories);

        productRepository.delete(product);
    }

    @Transactional
    public void confirmPurchase(Long productId, Long bidderId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (product.isPurchaseConfirmed()) {
            throw new IllegalArgumentException("이미 구매가 확정된 상품입니다.");
        }

        Member highestBidder = memberRepository.findById(bidderId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        if (highestBidder.getPoints() < product.getCurrentPrice()) {
            throw new IllegalArgumentException("잔고가 부족합니다.");
        }

        highestBidder.setPoints(highestBidder.getPoints() - product.getCurrentPrice());
        product.setPurchaseConfirmed(true);
        productRepository.save(product);
        memberRepository.save(highestBidder);
    }

}
