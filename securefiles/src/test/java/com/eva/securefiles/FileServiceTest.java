package com.eva.securefiles;

import com.eva.securefiles.model.FileMetadata;
import com.eva.securefiles.service.FileService;
import com.eva.securefiles.service.StorageService;
import com.eva.securefiles.service.TokenDenylistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;

@SpringBootTest
@Transactional
class FileServiceTest {

    @Autowired
    private FileService fileService;

    @MockBean
    private StorageService storageService;

    @MockBean
    private TokenDenylistService tokenDenylistService;

    private final Map<String, byte[]> storage = new HashMap<>();

    @BeforeEach
    void setUp() throws Exception {
        storage.clear();
        doAnswer(invocation -> {
            storage.put(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(storageService).store(anyString(), any(byte[].class));

        when(storageService.retrieve(anyString())).thenAnswer(
                invocation -> storage.get(invocation.getArgument(0, String.class)));
    }

    @Test
    void testUploadDownloadRoundtrip() throws Exception {
        byte[] original = "Hello, this is test content!".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", original);

        FileMetadata metadata = fileService.saveFile(file, "admin");
        byte[] downloaded = fileService.downloadFile(metadata.getId());

        assertArrayEquals(original, downloaded);
    }

    @Test
    void testStoredBytesAreDifferentFromOriginal() throws Exception {
        byte[] original = "Secret content".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "secret.txt", "text/plain", original);

        fileService.saveFile(file, "admin");

        byte[] stored = storage.values().iterator().next();
        assertFalse(Arrays.equals(original, stored));
    }

    @Test
    void testTwoUploadsOfSameContentProduceDifferentCiphertext() throws Exception {
        byte[] content = "Same content".getBytes();

        fileService.saveFile(new MockMultipartFile("file", "a.txt", "text/plain", content), "admin");
        byte[] stored1 = storage.values().stream().findFirst().orElseThrow().clone();

        storage.clear();
        fileService.saveFile(new MockMultipartFile("file", "b.txt", "text/plain", content), "admin");
        byte[] stored2 = storage.values().iterator().next();

        assertFalse(Arrays.equals(stored1, stored2));
    }

    @Test
    void testInvalidFileTypeIsRejected() {
        byte[] zipMagicBytes = new byte[]{0x50, 0x4B, 0x03, 0x04, 0x00, 0x00};
        MockMultipartFile file = new MockMultipartFile("file", "bad.zip", "application/zip", zipMagicBytes);

        assertThrows(IllegalArgumentException.class, () -> fileService.saveFile(file, "admin"));
    }

    @Test
    void testPathTraversalInFilenameIsStripped() throws Exception {
        byte[] content = "safe content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file", "../../etc/passwd", "text/plain", content);

        FileMetadata metadata = fileService.saveFile(file, "admin");

        assertEquals("passwd", metadata.getFileName());
    }
}
