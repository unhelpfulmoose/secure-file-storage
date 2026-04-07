package com.eva.securefiles.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class TokenDenylistService {

    private static final String KEY_PREFIX = "denied:";

    private final RedisTemplate<String, String> redisTemplate;

    public TokenDenylistService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void denyToken(String jti, long ttlSeconds) {
        redisTemplate.opsForValue().set(KEY_PREFIX + jti, "1", ttlSeconds, TimeUnit.SECONDS);
    }

    public boolean isDenied(String jti) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(KEY_PREFIX + jti));
    }
}
