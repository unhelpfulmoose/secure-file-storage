package com.eva.securefiles;

import com.eva.securefiles.service.StorageService;
import com.eva.securefiles.service.TokenDenylistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StorageService storageService;

    @MockBean
    private TokenDenylistService tokenDenylistService;

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testUploadFileAsAdmin() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "Hello World".getBytes()
        );

        mockMvc.perform(multipart("/files/upload").file(file))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void testUploadFileAsUserForbidden() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "Hello World".getBytes()
        );

        mockMvc.perform(multipart("/files/upload").file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void testGetFilesAsUser() throws Exception {
        mockMvc.perform(get("/files"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void testGetFilesReturnsPagedResult() throws Exception {
        mockMvc.perform(get("/files")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void testDeleteFileAsUserForbidden() throws Exception {
        mockMvc.perform(delete("/files/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testDownloadNonExistentFileReturns404() throws Exception {
        mockMvc.perform(get("/files/99999/download"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testUploadInvalidFileTypeRejected() throws Exception {
        // ZIP magic bytes — Tika detects as application/zip which is not in the allowed list
        byte[] zipMagicBytes = new byte[]{0x50, 0x4B, 0x03, 0x04, 0x00, 0x00};
        MockMultipartFile file = new MockMultipartFile(
                "file", "malicious.zip", "application/zip", zipMagicBytes
        );

        mockMvc.perform(multipart("/files/upload").file(file))
                .andExpect(status().isBadRequest());
    }
}