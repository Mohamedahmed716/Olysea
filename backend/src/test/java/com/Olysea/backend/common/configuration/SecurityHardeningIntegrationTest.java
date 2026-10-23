package com.Olysea.backend.common.configuration;

import com.Olysea.backend.common.ratelimit.SlidingWindowRateLimiter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityHardeningIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SlidingWindowRateLimiter slidingWindowRateLimiter;

    @BeforeEach
    void setUp() {
        slidingWindowRateLimiter.clear();
    }

    @Test
    void securityHeadersAreEnforcedOnResponses() throws Exception {
        mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"))
                .andExpect(header().string("Content-Security-Policy", containsString("default-src 'self'")));
    }

    @Test
    void unknownEndpointIsDeniedByDefault() throws Exception {
        mockMvc.perform(get("/api/unknown/endpoint"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void publicEndpointsRejectUnauthorizedMutations() throws Exception {
        // Mutating a public read route directly should be denied by denyAll()
        mockMvc.perform(post("/api/projects")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void slidingWindowRateLimitingEnforcesLimitsAndSetsRetryAfterHeader() throws Exception {
        String testIp = "192.168.1.100";
        // Fill up rate limit bucket for this test key up to test limit (100)
        for (int i = 0; i < 100; i++) {
            slidingWindowRateLimiter.tryAcquire("public:ip:" + testIp, 100, 60);
        }

        mockMvc.perform(get("/api/projects").with(request -> {
                    request.setRemoteAddr(testIp);
                    return request;
                }))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists(HttpHeaders.RETRY_AFTER));
    }
}
