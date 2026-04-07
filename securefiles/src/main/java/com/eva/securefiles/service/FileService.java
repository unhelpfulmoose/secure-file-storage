package com.eva.securefiles.service;

import com.eva.securefiles.model.FileMetadata;
import com.eva.securefiles.repository.FileRepository;
import jakarta.annotation.PostConstruct;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class FileService {

    private static final byte[] MASTER_KEY_SALT = "securefiles-master-key-salt-v1".getBytes(StandardCharsets.UTF_8);
    private static final int PBKDF2_ITERATIONS = 310_000;
    private static final int PBKDF2_KEY_LENGTH = 256;

    private final FileRepository fileRepository;
    private final EncryptionService encryptionService;
    private final StorageService storageService;
    private final Tika tika = new Tika();

    @Value("${app.master.key}")
    private String masterKeyString;

    private SecretKey masterKey;

    public FileService(FileRepository fileRepository,
                       EncryptionService encryptionService,
                       StorageService storageService) {
        this.fileRepository = fileRepository;
        this.encryptionService = encryptionService;
        this.storageService = storageService;
    }

    // Derive master key once at startup using PBKDF2 — expensive by design
    @PostConstruct
    public void initMasterKey() throws Exception {
        PBEKeySpec spec = new PBEKeySpec(
                masterKeyString.toCharArray(),
                MASTER_KEY_SALT,
                PBKDF2_ITERATIONS,
                PBKDF2_KEY_LENGTH
        );
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        byte[] keyBytes = factory.generateSecret(spec).getEncoded();
        masterKey = new SecretKeySpec(keyBytes, "AES");
        spec.clearPassword();
    }

    @Transactional
    public FileMetadata saveFile(MultipartFile file) throws Exception {
        // Validate filename
        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("File must have a name.");
        }
        // Strip any path components to prevent path traversal
        fileName = fileName.replaceAll(".*[/\\\\]", "");

        // Detect actual MIME type from file bytes, not client-supplied header
        byte[] fileBytes = file.getBytes();
        String detectedType = tika.detect(fileBytes);
        if (!isAllowedFileType(detectedType)) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: PDF, images, text, audio, video.");
        }

        // Generate a per-file AES key and encrypt the file
        SecretKey fileKey = encryptionService.generateKey();
        byte[] encryptedData = encryptionService.encrypt(fileBytes, fileKey);

        // Wrap the file key with the master key before storing in DB (envelope encryption)
        byte[] wrappedKey = encryptionService.encrypt(fileKey.getEncoded(), masterKey);
        String encodedWrappedKey = Base64.getEncoder().encodeToString(wrappedKey);

        // DB save first — if MinIO fails below, @Transactional rolls this back
        String storageKey = UUID.randomUUID().toString();
        FileMetadata metadata = new FileMetadata();
        metadata.setFileName(fileName);
        metadata.setFileType(detectedType);
        metadata.setStorageKey(storageKey);
        metadata.setUploadAt(LocalDateTime.now());
        metadata.setEncryptionKey(encodedWrappedKey);
        fileRepository.save(metadata);

        storageService.store(storageKey, encryptedData);

        return metadata;
    }

    public Page<FileMetadata> getAllFiles(Pageable pageable) {
        return fileRepository.findAll(pageable);
    }

    public FileMetadata getFileById(Long id) {
        return fileRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("File not found."));
    }

    @Transactional
    public void deleteFile(Long id) throws Exception {
        FileMetadata metadata = fileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File not found."));
        // DB delete first — if MinIO fails, @Transactional rolls back the DB delete
        fileRepository.delete(metadata);
        storageService.delete(metadata.getStorageKey());
    }

    public byte[] downloadFile(Long id) throws Exception {
        FileMetadata metadata = fileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File not found."));

        byte[] wrappedKey = Base64.getDecoder().decode(metadata.getEncryptionKey());
        byte[] keyBytes = encryptionService.decrypt(wrappedKey, masterKey);
        SecretKey fileKey = new SecretKeySpec(keyBytes, "AES");

        byte[] encryptedData = storageService.retrieve(metadata.getStorageKey());
        return encryptionService.decrypt(encryptedData, fileKey);
    }

    private boolean isAllowedFileType(String contentType) {
        return contentType.startsWith("image/") ||
                contentType.startsWith("audio/") ||
                contentType.startsWith("video/") ||
                contentType.equals("application/pdf") ||
                contentType.equals("text/plain");
    }
}
