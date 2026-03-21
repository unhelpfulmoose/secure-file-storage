package com.eva.securefiles;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FileService {

    private final FileRepository fileRepository;
    private final String uploadDir = "uploads/";

    public FileService(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    public FileMetadata saveFile(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || contentType.equals("application/octet-stream")) {
            throw new IllegalArgumentException("Invalid file type.");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName) ;
        Files.write(filePath, file.getBytes());

        FileMetadata metadata = new FileMetadata();
        metadata.setFileName(fileName);
        metadata.setFileType(file.getContentType());
        metadata.setStoragePath(filePath.toString());
        metadata.setUploadAt(LocalDateTime.now());

        return fileRepository.save(metadata);
    }

    public List<FileMetadata> getAllFiles() {
        return fileRepository.findAll();
    }
}