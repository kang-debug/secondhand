// ProductController.java
package com.example.back.controller;

import com.example.back.dto.BidHistoryDto;
import com.example.back.dto.ProductDto;
import com.example.back.entity.BidHistory;
import com.example.back.entity.Product;
import com.example.back.repository.BidHistoryRepository;
import com.example.back.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;
    @Autowired
    private BidHistoryRepository bidHistoryRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    // 상품 등록
    @PostMapping("/create")
    public ResponseEntity<String> createProduct(
            @RequestParam("memberId") Long memberId,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("startingPrice") Long startingPrice,
            @RequestParam("images") List<MultipartFile> images) {

        try {
            productService.createProduct(memberId, name, description, startingPrice, images);
            return ResponseEntity.ok("상품이 성공적으로 등록되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("상품 등록 중 오류 발생: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("상품 등록 중 오류가 발생했습니다.");
        }
    }

    // 모든 상품 조회
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        List<ProductDto> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable("id") Long productId) {
        Product product = productService.getProductById(productId);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<ProductDto>> getProductsByMemberId(@PathVariable("memberId") Long memberId) {
        List<ProductDto> products = productService.getProductsByMember(memberId);
        return ResponseEntity.ok(products);
    }

    // 현재 입찰 가격 업데이트
    @PatchMapping("/{id}/bid")
    public ResponseEntity<String> updateCurrentPrice(@PathVariable("id") Long productId, @RequestBody Map<String, Object> requestBody) {
        try {
            Long newBidPrice = Long.parseLong(requestBody.get("newBidPrice").toString());
            Long bidderId = Long.parseLong(requestBody.get("bidderId").toString());

            productService.updateCurrentPrice(productId, newBidPrice, bidderId);
            Product product = productService.getProductById(productId);

            messagingTemplate.convertAndSend("/topic/bid-updates",
                    product.getName() + " 상품이 새롭게 입찰 되었습니다!");

            return ResponseEntity.ok("입찰이 성공적으로 업데이트되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/bids/member/{memberId}")
    public ResponseEntity<List<BidHistoryDto>> getBidHistoryByMemberId(@PathVariable("memberId") Long memberId) {
        List<BidHistoryDto> bidHistories = productService.getBidHistoryByMemberId(memberId);
        return ResponseEntity.ok(bidHistories);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable("id") Long productId) {
        try {
            productService.deleteProduct(productId);
            return ResponseEntity.ok("상품이 성공적으로 삭제되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("상품 삭제 중 오류 발생: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("상품 삭제 중 오류가 발생했습니다.");
        }
    }
}
