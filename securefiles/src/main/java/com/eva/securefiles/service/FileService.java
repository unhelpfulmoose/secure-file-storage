package com.eva.securefiles.service;

import com.eva.securefiles.model.FileMetadata;
import com.eva.securefiles.repository.FileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.SecretKey;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
public class FileService {

    private final FileRepository fileRepository;
    private final EncryptionService encryptionService;
    private final String uploadDir = "uploads/";

    public FileService(FileRepository fileRepository, EncryptionService encryptionService) {
        this.fileRepository = fileRepository;
        this.encryptionService = encryptionService;
    }

    public FileMetadata saveFile(MultipartFile file) throws Exception {
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedFileType(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: PDF, images, text, audio, video.");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        SecretKey key = encryptionService.generateKey();
        byte[] encryptedData = encryptionService.encrypt(file.getBytes(), key);

        String fileName = file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.write(filePath, encryptedData);

        String encodedKey = Base64.getEncoder().encodeToString(key.getEncoded());

        FileMetadata metadata = new FileMetadata();
        metadata.setFileName(fileName);
        metadata.setFileType(file.getContentType());
        metadata.setStoragePath(filePath.toString());
        metadata.setUploadAt(LocalDateTime.now());
        metadata.setEncryptionKey(encodedKey);

        return fileRepository.save(metadata);
    }

    public List<FileMetadata> getAllFiles() {
        return fileRepository.findAll();
    }

    public FileMetadata getFileById(Long id) {
        return fileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File not found."));
    }

    private boolean isAllowedFileType(String contentType) {
        return contentType.startsWith("image/") ||
                contentType.startsWith("audio/") ||
                contentType.startsWith("video/") ||
                contentType.equals("doc/pdf") ||
                contentType.equals("text");
    }

    public byte[] downloadFile(Long id) throws Exception {
        FileMetadata metadata = fileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File not found."));

        byte[] encryptedData = Files.readAllBytes(Paths.get(metadata.getStoragePath()));
        byte[] keyBytes = Base64.getDecoder().decode(metadata.getEncryptionKey());
        SecretKey key = encryptionService.bytesToKey(keyBytes);

        return encryptionService.decrypt(encryptedData, key);
    }
}