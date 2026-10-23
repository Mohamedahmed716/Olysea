package com.Olysea.backend.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LoginAttemptServiceTest {

    private LoginAttemptService loginAttemptService;

    @BeforeEach
    void setUp() {
        loginAttemptService = new LoginAttemptService();
        loginAttemptService.reset();
    }

    @Test
    void isBlockedReturnsFalseInitially() {
        assertThat(loginAttemptService.isBlocked("test-user")).isFalse();
    }

    @Test
    void isBlockedReturnsTrueAfterMaxAttempts() {
        String key = "ip:192.168.1.50";
        for (int i = 0; i < LoginAttemptService.MAX_ATTEMPTS - 1; i++) {
            loginAttemptService.recordFailure(key);
            assertThat(loginAttemptService.isBlocked(key)).isFalse();
        }

        loginAttemptService.recordFailure(key);
        assertThat(loginAttemptService.isBlocked(key)).isTrue();
    }

    @Test
    void recordSuccessResetsAttempts() {
        String key = "ip:192.168.1.55";
        for (int i = 0; i < LoginAttemptService.MAX_ATTEMPTS; i++) {
            loginAttemptService.recordFailure(key);
        }
        assertThat(loginAttemptService.isBlocked(key)).isTrue();

        loginAttemptService.recordSuccess(key);
        assertThat(loginAttemptService.isBlocked(key)).isFalse();
    }

    @Test
    void getRetryAfterSecondsReturnsPositiveDuration() {
        String key = "ip:192.168.1.60";
        loginAttemptService.recordFailure(key);

        long retryAfter = loginAttemptService.getRetryAfterSeconds(key);
        assertThat(retryAfter).isGreaterThan(0).isLessThanOrEqualTo(LoginAttemptService.WINDOW_SECONDS);
    }

    @Test
    void resetClearsAllAttempts() {
        loginAttemptService.recordFailure("user1");
        loginAttemptService.recordFailure("user2");

        loginAttemptService.reset();

        assertThat(loginAttemptService.isBlocked("user1")).isFalse();
        assertThat(loginAttemptService.isBlocked("user2")).isFalse();
    }
}
