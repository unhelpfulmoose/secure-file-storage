package com.eva.securefiles;

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
        if (contentType == null || contentType.equals("application/octet-stream")) {
            throw new IllegalArgumentException("Invalid file type.");
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
}