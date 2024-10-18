package com.example.back.service;

import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.UUID;

@Service
public class GCSService {

    private static final Logger logger = LoggerFactory.getLogger(GCSService.class);

    private final Storage storage;
    private final String bucketName;

    public GCSService(@Value("${gcs.bucket-name}") String bucketName,
                      @Value("${gcs.credentials.file.path}") String credentialsPath) throws IOException {
        this.bucketName = bucketName;
        try (FileInputStream serviceAccountStream = new FileInputStream(credentialsPath)) {
            this.storage = StorageOptions.newBuilder()
                    .setCredentials(ServiceAccountCredentials.fromStream(serviceAccountStream))
                    .build()
                    .getService();
        }
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, fileName)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        String fileUrl = String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);
        logger.info("Uploaded file URL: " + fileUrl); // URL을 로그로 출력

        return fileUrl;
    }
}