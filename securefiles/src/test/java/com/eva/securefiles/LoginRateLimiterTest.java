package com.eva.securefiles;

import com.eva.securefiles.config.LoginRateLimiter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LoginRateLimiterTest {

    private LoginRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new LoginRateLimiter();
    }

    @Test
    void testIpNotBlockedInitially() {
        assertFalse(rateLimiter.isBlocked("192.168.1.1"));
    }

    @Test
    void testIpNotBlockedBelowMaxAttempts() {
        for (int i = 0; i < 4; i++) {
            rateLimiter.recordFailure("192.168.1.1");
        }
        assertFalse(rateLimiter.isBlocked("192.168.1.1"));
    }

    @Test
    void testIpBlockedAfterMaxAttempts() {
        for (int i = 0; i < 5; i++) {
            rateLimiter.recordFailure("192.168.1.1");
        }
        assertTrue(rateLimiter.isBlocked("192.168.1.1"));
    }

    @Test
    void testResetClearsBlock() {
        for (int i = 0; i < 5; i++) {
            rateLimiter.recordFailure("192.168.1.1");
        }
        rateLimiter.reset("192.168.1.1");
        assertFalse(rateLimiter.isBlocked("192.168.1.1"));
    }

    @Test
    void testDifferentIpsAreTrackedIndependently() {
        for (int i = 0; i < 5; i++) {
            rateLimiter.recordFailure("10.0.0.1");
        }
        assertTrue(rateLimiter.isBlocked("10.0.0.1"));
        assertFalse(rateLimiter.isBlocked("10.0.0.2"));
    }

    @Test
    void testResetOnOneIpDoesNotAffectAnother() {
        for (int i = 0; i < 5; i++) {
            rateLimiter.recordFailure("10.0.0.1");
            rateLimiter.recordFailure("10.0.0.2");
        }
        rateLimiter.reset("10.0.0.1");
        assertFalse(rateLimiter.isBlocked("10.0.0.1"));
        assertTrue(rateLimiter.isBlocked("10.0.0.2"));
    }
}
