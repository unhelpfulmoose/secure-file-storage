package com.eva.securefiles.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileType;

    @Column(name = "storage_key")
    private String storageKey;

    private LocalDateTime uploadAt;
    private String encryptionKey;

    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public String getFileType() { return fileType; }
    public String getStorageKey() { return storageKey; }
    public LocalDateTime getUploadAt() { return uploadAt; }
    public String getEncryptionKey() { return encryptionKey; }

    public void setId(Long id) { this.id = id; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }
    public void setUploadAt(LocalDateTime uploadAt) { this.uploadAt = uploadAt; }
    public void setEncryptionKey(String encryptionKey) { this.encryptionKey = encryptionKey; }
}
