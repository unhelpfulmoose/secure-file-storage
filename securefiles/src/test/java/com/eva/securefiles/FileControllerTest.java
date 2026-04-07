package com.eva.securefiles;

import com.eva.securefiles.service.StorageService;
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

@SpringBootTest
@AutoConfigureMockMvc
class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StorageService storageService;

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
}