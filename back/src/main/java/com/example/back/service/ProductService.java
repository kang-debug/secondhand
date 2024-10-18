package com.example.back.service;

import com.example.back.entity.Member;
import com.example.back.entity.Product;
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

    @Value("${gcs.bucket.name}")
    private String bucketName;

    private final Storage storage = StorageOptions.getDefaultInstance().getService();


    public String uploadToGCS(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();

        BlobId blobId = BlobId.of(bucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType(file.getContentType()).build();

        storage.create(blobInfo, file.getBytes());

        return String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);
    }


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
            String imageUrl = gcsService.uploadFile(image); // GCS에 업로드
            imageUrls.add(imageUrl);
        }

        product.setImageUrls(imageUrls); // 이미지 URL 리스트를 저장
        product.setImageUrl(imageUrls.get(0)); // 첫 번째 이미지의 URL을 대표 이미지로 저장
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

    public void updateCurrentPrice(Long productId, Long newBidPrice) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (newBidPrice > product.getCurrentPrice()) {
            product.setCurrentPrice(newBidPrice);
            productRepository.save(product);
        } else {
            throw new IllegalArgumentException("새로운 입찰가는 현재 입찰가보다 높아야 합니다.");
        }
    }

}
