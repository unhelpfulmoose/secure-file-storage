package com.eva.securefiles.config;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// Tracks failed login attempts per IP address.
// Blocks an IP for BLOCK_DURATION_SECONDS after MAX_ATTEMPTS failures within that window.
@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION_SECONDS = 15 * 60; // 15 minutes

    private record AttemptRecord(int count, Instant blockedAt) {}

    private final Map<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

    // Returns true if the IP is currently blocked
    public boolean isBlocked(String ip) {
        AttemptRecord record = attempts.get(ip);
        if (record == null || record.count() < MAX_ATTEMPTS) return false;

        boolean stillBlocked = record.blockedAt()
                .plusSeconds(BLOCK_DURATION_SECONDS)
                .isAfter(Instant.now());

        if (!stillBlocked) {
            attempts.remove(ip);
        }
        return stillBlocked;
    }

    // Call this on a failed login attempt
    public void recordFailure(String ip) {
        attempts.merge(ip, new AttemptRecord(1, Instant.now()),
                (existing, newVal) -> new AttemptRecord(existing.count() + 1, Instant.now()));
    }

    // Call this on a successful login to reset the counter
    public void reset(String ip) {
        attempts.remove(ip);
    }
}
