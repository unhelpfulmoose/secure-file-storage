package com.eva.securefiles.controller;

import com.eva.securefiles.model.FileMetadata;
import com.eva.securefiles.service.AuditService;
import com.eva.securefiles.service.FileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/files")
public class FileController {

    private final FileService fileService;
    private final AuditService auditService;

    public FileController(FileService fileService, AuditService auditService) {
        this.fileService = fileService;
        this.auditService = auditService;
    }

    @PostMapping("/upload")
    public ResponseEntity<FileMetadata> uploadFile(@RequestParam("file") MultipartFile file,
                                                   Authentication authentication) throws Exception {
        try {
            FileMetadata saved = fileService.saveFile(file);
            auditService.fileUploaded(authentication.getName(), saved.getFileName(), saved.getId());
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            auditService.uploadRejected(authentication.getName(), file.getOriginalFilename(), e.getMessage());
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<Page<FileMetadata>> getAllFiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        page = Math.max(0, page);
        size = Math.min(size, 100);
        return ResponseEntity.ok(fileService.getAllFiles(PageRequest.of(page, size)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id, Authentication authentication) throws Exception {
        FileMetadata metadata = fileService.getFileById(id);
        fileService.deleteFile(id);
        auditService.fileDeleted(authentication.getName(), metadata.getFileName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id, Authentication authentication) throws Exception {
        FileMetadata metadata = fileService.getFileById(id);
        byte[] decryptedData = fileService.downloadFile(id);

        auditService.fileDownloaded(authentication.getName(), metadata.getFileName(), id);

        String safeFileName = metadata.getFileName().replaceAll("[\\r\\n\"\\\\]", "_");
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + safeFileName + "\"")
                .header("Content-Type", metadata.getFileType())
                .body(decryptedData);
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<byte[]> previewFile(@PathVariable Long id, Authentication authentication) throws Exception {
        FileMetadata metadata = fileService.getFileById(id);
        byte[] decryptedData = fileService.downloadFile(id);

        auditService.filePreviewed(authentication.getName(), metadata.getFileName(), id);

        String safeFileName = metadata.getFileName().replaceAll("[\\r\\n\"\\\\]", "_");
        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=\"" + safeFileName + "\"")
                .header("Content-Type", metadata.getFileType())
                .body(decryptedData);
    }
}