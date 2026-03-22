package com.eva.securefiles;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

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
    public ResponseEntity<List<FileMetadata>> getAllFiles() {
        List<FileMetadata> files = fileService.getAllFiles();
        return ResponseEntity.ok(files);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id, Authentication authentication) throws Exception {
        FileMetadata metadata = fileService.getFileById(id);
        byte[] decryptedData = fileService.downloadFile(id);

        logger.info("User '{}' downloaded file '{}' (id: {})",
                authentication.getName(), metadata.getFileName(), id);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + metadata.getFileName() + "\"")
                .header("Content-Type", metadata.getFileType())
                .body(decryptedData);
    }
}