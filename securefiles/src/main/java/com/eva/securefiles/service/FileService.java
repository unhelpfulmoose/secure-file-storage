package com.eva.securefiles.service;

import com.eva.securefiles.model.FileMetadata;
import com.eva.securefiles.repository.FileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
public class FileService {

    private final FileRepository fileRepository;
    private final EncryptionService encryptionService;
    private final StorageService storageService;

    @Value("${app.master.key}")
    private String masterKeyString;

    public FileService(FileRepository fileRepository,
                       EncryptionService encryptionService,
                       StorageService storageService) {
        this.fileRepository = fileRepository;
        this.encryptionService = encryptionService;
        this.storageService = storageService;
    }

    public FileMetadata saveFile(MultipartFile file) throws Exception {
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedFileType(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: PDF, images, text, audio, video.");
        }

        // Generate a per-file AES key and encrypt the file
        SecretKey fileKey = encryptionService.generateKey();
        byte[] encryptedData = encryptionService.encrypt(file.getBytes(), fileKey);

        // Wrap the file key with the master key before storing in DB (envelope encryption)
        SecretKey masterKey = deriveMasterKey();
        byte[] wrappedKey = encryptionService.encrypt(fileKey.getEncoded(), masterKey);
        String encodedWrappedKey = Base64.getEncoder().encodeToString(wrappedKey);

        // Store encrypted file in MinIO under a UUID key
        String storageKey = UUID.randomUUID().toString();
        storageService.store(storageKey, encryptedData);

        FileMetadata metadata = new FileMetadata();
        metadata.setFileName(file.getOriginalFilename());
        metadata.setFileType(contentType);
        metadata.setStorageKey(storageKey);
        metadata.setUploadAt(LocalDateTime.now());
        metadata.setEncryptionKey(encodedWrappedKey);

        return fileRepository.save(metadata);
    }

    public Page<FileMetadata> getAllFiles(Pageable pageable) {
        return fileRepository.findAll(pageable);
    }

    public FileMetadata getFileById(Long id) {
        return fileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File not found."));
    }

    public void deleteFile(Long id) throws Exception {
        FileMetadata metadata = fileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File not found."));
        storageService.delete(metadata.getStorageKey());
        fileRepository.delete(metadata);
    }

    public byte[] downloadFile(Long id) throws Exception {
        FileMetadata metadata = fileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File not found."));

        // Unwrap the file key using the master key
        SecretKey masterKey = deriveMasterKey();
        byte[] wrappedKey = Base64.getDecoder().decode(metadata.getEncryptionKey());
        byte[] keyBytes = encryptionService.decrypt(wrappedKey, masterKey);
        SecretKey fileKey = new SecretKeySpec(keyBytes, "AES");

        byte[] encryptedData = storageService.retrieve(metadata.getStorageKey());
        return encryptionService.decrypt(encryptedData, fileKey);
    }

    private SecretKey deriveMasterKey() throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] keyBytes = digest.digest(masterKeyString.getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(keyBytes, "AES");
    }

    private boolean isAllowedFileType(String contentType) {
        return contentType.startsWith("image/") ||
                contentType.startsWith("audio/") ||
                contentType.startsWith("video/") ||
                contentType.equals("application/pdf") ||
                contentType.equals("text/plain");
    }
}
