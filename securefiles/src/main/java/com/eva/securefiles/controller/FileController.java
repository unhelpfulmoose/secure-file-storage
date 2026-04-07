package com.eva.securefiles.controller;

import com.eva.securefiles.model.FileMetadata;
import com.eva.securefiles.service.FileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/files")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/upload")
    public ResponseEntity<FileMetadata> uploadFile(@RequestParam("file") MultipartFile file) throws Exception {
        FileMetadata saved = fileService.saveFile(file);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<Page<FileMetadata>> getAllFiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        size = Math.min(size, 100);
        return ResponseEntity.ok(fileService.getAllFiles(PageRequest.of(page, size)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id, Authentication authentication) throws Exception {
        FileMetadata metadata = fileService.getFileById(id);
        fileService.deleteFile(id);
        logger.info("User '{}' deleted file '{}' (id: {})",
                authentication.getName(), metadata.getFileName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id, Authentication authentication) throws Exception {
        FileMetadata metadata = fileService.getFileById(id);
        byte[] decryptedData = fileService.downloadFile(id);

        logger.info("User '{}' downloaded file '{}' (id: {})",
                authentication.getName(), metadata.getFileName(), id);

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

        logger.info("User '{}' previewed file '{}' (id: {})",
                authentication.getName(), metadata.getFileName(), id);

        String safeFileName = metadata.getFileName().replaceAll("[\\r\\n\"\\\\]", "_");
        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=\"" + safeFileName + "\"")
                .header("Content-Type", metadata.getFileType())
                .body(decryptedData);
    }
}