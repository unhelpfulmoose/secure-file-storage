package com.eva.securefiles;

import com.eva.securefiles.service.StorageService;
import com.eva.securefiles.service.TokenDenylistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StorageService storageService;

    @MockBean
    private TokenDenylistService tokenDenylistService;

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testGetAuditLogAsAdmin() throws Exception {
        mockMvc.perform(get("/audit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void testGetAuditLogAsUserForbidden() throws Exception {
        mockMvc.perform(get("/audit"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetAuditLogUnauthenticatedIsUnauthorized() throws Exception {
        mockMvc.perform(get("/audit"))
                .andExpect(status().isUnauthorized());
    }
}
