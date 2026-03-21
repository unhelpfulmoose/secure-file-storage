package com.eva.securefiles;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/upload")
    public ResponseEntity<FileMetadata> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        FileMetadata saved = fileService.saveFile(file);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<FileMetadata>> getAllFiles() {
        List<FileMetadata> files = fileService.getAllFiles();
        return ResponseEntity.ok(files);
    }
}