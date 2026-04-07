package com.eva.securefiles.service;

import io.minio.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;

@Service
public class StorageService {

    private final MinioClient minioClient;

    @Value("${app.storage.bucket}")
    private String bucket;

    public StorageService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    @PostConstruct
    public void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        }
    }

    public void store(String key, byte[] data) throws Exception {
        minioClient.putObject(PutObjectArgs.builder()
                .bucket(bucket)
                .object(key)
                .stream(new ByteArrayInputStream(data), data.length, -1)
                .build());
    }

    public byte[] retrieve(String key) throws Exception {
        return minioClient.getObject(GetObjectArgs.builder()
                .bucket(bucket)
                .object(key)
                .build())
                .readAllBytes();
    }

    public void delete(String key) throws Exception {
        minioClient.removeObject(RemoveObjectArgs.builder()
                .bucket(bucket)
                .object(key)
                .build());
    }
}
