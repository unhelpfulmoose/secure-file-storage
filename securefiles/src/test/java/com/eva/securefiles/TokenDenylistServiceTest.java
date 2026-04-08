package com.eva.securefiles;

import com.eva.securefiles.service.TokenDenylistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

// Pure unit test — no Spring context, no database, no Redis server needed.
// RedisTemplate is mocked so we can verify the correct calls are made.
@ExtendWith(MockitoExtension.class)
class TokenDenylistServiceTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private TokenDenylistService tokenDenylistService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void testDenyTokenStoresKeyWithPrefixAndTtl() {
        tokenDenylistService.denyToken("abc-123", 3600);

        // Verify Redis is called with the correct key prefix, value, and TTL
        verify(valueOperations).set("denied:abc-123", "1", 3600L, TimeUnit.SECONDS);
    }

    @Test
    void testIsDeniedReturnsTrueForDeniedToken() {
        when(redisTemplate.hasKey("denied:abc-123")).thenReturn(true);

        assertTrue(tokenDenylistService.isDenied("abc-123"));
    }

    @Test
    void testIsDeniedReturnsFalseForNonDeniedToken() {
        when(redisTemplate.hasKey("denied:unknown")).thenReturn(false);

        assertFalse(tokenDenylistService.isDenied("unknown"));
    }
}
