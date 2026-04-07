package com.eva.securefiles;

import com.eva.securefiles.service.JwtService;
import com.eva.securefiles.service.StorageService;
import com.eva.securefiles.service.TokenDenylistService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JwtSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private StorageService storageService;

    @MockBean
    private TokenDenylistService tokenDenylistService;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @BeforeEach
    void resetMocks() {
        reset(tokenDenylistService);
    }

    @Test
    void testRequestWithoutTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get("/files"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRequestWithInvalidTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get("/files")
                        .header("Authorization", "Bearer thisisnotavalidtoken"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRequestWithExpiredTokenIsUnauthorized() throws Exception {
        String expiredToken = Jwts.builder()
                .subject("user")
                .claim("roles", "ROLE_USER")
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date(System.currentTimeMillis() - 2000))
                .expiration(new Date(System.currentTimeMillis() - 1000))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        mockMvc.perform(get("/files")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRequestWithRevokedTokenIsUnauthorized() throws Exception {
        UserDetails userDetails = User.withUsername("user")
                .password("password")
                .roles("USER")
                .build();
        String token = jwtService.generateToken(userDetails);
        String jti = jwtService.extractJti(token);

        when(tokenDenylistService.isDenied(jti)).thenReturn(true);

        mockMvc.perform(get("/files")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }
}
