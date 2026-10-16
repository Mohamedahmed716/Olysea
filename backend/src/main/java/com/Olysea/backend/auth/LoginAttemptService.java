package com.Olysea.backend.auth;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_SECONDS = 900;

    private final ConcurrentHashMap<String, AttemptWindow> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        AttemptWindow window = attempts.get(key);

        if (window == null) {
            return false;
        }

        synchronized (window) {
            if (expired(window)) {
                attempts.remove(key, window);
                return false;
            }

            return window.count >= MAX_ATTEMPTS;
        }
    }

    public void recordFailure(String key) {
        attempts.compute(key, (ignored, existing) -> {
            if (existing == null || expired(existing)) {
                return new AttemptWindow();
            }

            synchronized (existing) {
                existing.count++;
            }

            return existing;
        });
    }

    public void recordSuccess(String key) {
        attempts.remove(key);
    }

    private boolean expired(AttemptWindow window) {
        return Instant.now().getEpochSecond() - window.startedAt >= WINDOW_SECONDS;
    }

    private static class AttemptWindow {
        private final long startedAt = Instant.now().getEpochSecond();
        private int count = 1;
    }
}