package com.Olysea.backend.common.ratelimit;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe in-memory sliding window rate limiter.
 * Tracks request epoch timestamps to provide true sliding-window rate limiting
 * with exact Retry-After calculation and bounded memory consumption.
 */
@Component
public class SlidingWindowRateLimiter {

    private static final int MAX_TRACKED_KEYS = 50_000;
    private final ConcurrentHashMap<String, Deque<Long>> requestBuckets = new ConcurrentHashMap<>();

    public record RateLimitResult(boolean allowed, long retryAfterSeconds) {
        public static RateLimitResult permit() {
            return new RateLimitResult(true, 0);
        }

        public static RateLimitResult reject(long retryAfterSeconds) {
            return new RateLimitResult(false, Math.max(1, retryAfterSeconds));
        }
    }

    public RateLimitResult tryAcquire(String key, int maxRequests, long windowSeconds) {
        long now = Instant.now().getEpochSecond();
        long windowStart = now - windowSeconds;

        if (requestBuckets.size() >= MAX_TRACKED_KEYS) {
            purgeExpired(windowStart);
        }

        Deque<Long> bucket = requestBuckets.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (bucket) {
            while (!bucket.isEmpty() && bucket.peekFirst() <= windowStart) {
                bucket.removeFirst();
            }

            if (bucket.size() >= maxRequests) {
                Long oldest = bucket.peekFirst();
                long retryAfter = oldest != null ? Math.max(1, (oldest + windowSeconds) - now) : windowSeconds;
                return RateLimitResult.reject(retryAfter);
            }

            bucket.addLast(now);
            return RateLimitResult.permit();
        }
    }

    public void reset(String key) {
        requestBuckets.remove(key);
    }

    public void clear() {
        requestBuckets.clear();
    }

    private void purgeExpired(long windowStart) {
        requestBuckets.forEach((key, bucket) -> {
            synchronized (bucket) {
                while (!bucket.isEmpty() && bucket.peekFirst() <= windowStart) {
                    bucket.removeFirst();
                }
                if (bucket.isEmpty()) {
                    requestBuckets.remove(key, bucket);
                }
            }
        });
    }
}
