package com.Olysea.backend.common.ratelimit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SlidingWindowRateLimiterTest {

    private SlidingWindowRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new SlidingWindowRateLimiter();
        rateLimiter.clear();
    }

    @Test
    void allowsRequestsUpToMaxLimit() {
        String key = "test-client";
        int limit = 5;

        for (int i = 0; i < limit; i++) {
            SlidingWindowRateLimiter.RateLimitResult result = rateLimiter.tryAcquire(key, limit, 60);
            assertThat(result.allowed()).isTrue();
            assertThat(result.retryAfterSeconds()).isEqualTo(0);
        }

        SlidingWindowRateLimiter.RateLimitResult rejected = rateLimiter.tryAcquire(key, limit, 60);
        assertThat(rejected.allowed()).isFalse();
        assertThat(rejected.retryAfterSeconds()).isGreaterThan(0);
    }

    @Test
    void resetClearsRateLimitBucketForSpecificKey() {
        String key = "blocked-client";
        for (int i = 0; i < 3; i++) {
            rateLimiter.tryAcquire(key, 3, 60);
        }
        assertThat(rateLimiter.tryAcquire(key, 3, 60).allowed()).isFalse();

        rateLimiter.reset(key);
        assertThat(rateLimiter.tryAcquire(key, 3, 60).allowed()).isTrue();
    }

    @Test
    void clearPurgesAllBuckets() {
        rateLimiter.tryAcquire("key1", 1, 60);
        rateLimiter.tryAcquire("key2", 1, 60);

        assertThat(rateLimiter.tryAcquire("key1", 1, 60).allowed()).isFalse();
        assertThat(rateLimiter.tryAcquire("key2", 1, 60).allowed()).isFalse();

        rateLimiter.clear();

        assertThat(rateLimiter.tryAcquire("key1", 1, 60).allowed()).isTrue();
        assertThat(rateLimiter.tryAcquire("key2", 1, 60).allowed()).isTrue();
    }
}
