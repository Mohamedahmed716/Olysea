package com.Olysea.backend.auth;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    public static final int MAX_ATTEMPTS = 5;
    public static final long WINDOW_SECONDS = 60;
    private static final int MAX_TRACKED_KEYS = 10_000;

    private final ConcurrentHashMap<String, Deque<Long>> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        Deque<Long> timestamps = attempts.get(key);
        if (timestamps == null) {
            return false;
        }
        long now = Instant.now().getEpochSecond();
        long windowStart = now - WINDOW_SECONDS;
        synchronized (timestamps) {
            pruneExpired(timestamps, windowStart);
            if (timestamps.isEmpty()) {
                attempts.remove(key, timestamps);
                return false;
            }
            return timestamps.size() >= MAX_ATTEMPTS;
        }
    }

    public long getRetryAfterSeconds(String key) {
        Deque<Long> timestamps = attempts.get(key);
        if (timestamps == null) {
            return WINDOW_SECONDS;
        }
        long now = Instant.now().getEpochSecond();
        synchronized (timestamps) {
            Long oldest = timestamps.peekFirst();
            if (oldest == null) {
                return WINDOW_SECONDS;
            }
            return Math.max(1, (oldest + WINDOW_SECONDS) - now);
        }
    }

    public void recordFailure(String key) {
        long now = Instant.now().getEpochSecond();
        long windowStart = now - WINDOW_SECONDS;

        if (attempts.size() >= MAX_TRACKED_KEYS) {
            purgeOldEntries(windowStart);
        }

        attempts.compute(key, (k, existing) -> {
            Deque<Long> deque = existing != null ? existing : new ArrayDeque<>();
            synchronized (deque) {
                pruneExpired(deque, windowStart);
                deque.addLast(now);
            }
            return deque;
        });
    }

    public void recordSuccess(String key) {
        attempts.remove(key);
    }

    public void reset() {
        attempts.clear();
    }

    private void pruneExpired(Deque<Long> deque, long windowStart) {
        while (!deque.isEmpty() && deque.peekFirst() <= windowStart) {
            deque.removeFirst();
        }
    }

    private void purgeOldEntries(long windowStart) {
        attempts.forEach((k, deque) -> {
            synchronized (deque) {
                pruneExpired(deque, windowStart);
                if (deque.isEmpty()) {
                    attempts.remove(k, deque);
                }
            }
        });
    }
}
