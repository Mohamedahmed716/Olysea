
package com.Olysea.backend.auth;

import com.Olysea.backend.model.User;
import com.Olysea.backend.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthSecurityIntegrationTest {

        private static final String EMAIL = "admin@olysea.test";
        private static final String PASSWORD = "Correct-Test-Password-123!";

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private LoginAttemptService loginAttemptService;

        @BeforeEach
        void setUp() {
                userRepository.deleteAll();

                loginAttemptService.recordSuccess("ip:127.0.0.1");
                loginAttemptService.recordSuccess("email:" + sha256(EMAIL));

                userRepository.saveAndFlush(
                                new User(
                                                EMAIL,
                                                passwordEncoder.encode(PASSWORD),
                                                Role.ADMIN));
        }

        @Test
        void anonymousUserCannotAccessAdminApi() throws Exception {
                mockMvc.perform(get("/api/admin/me"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void invalidLoginReturnsUnauthorized() throws Exception {
                mockMvc.perform(post("/api/admin/login")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginJson(EMAIL, "wrong-password")))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.status").value(401))
                                .andExpect(jsonPath("$.error").value("Unauthorized"))
                                .andExpect(jsonPath("$.message")
                                                .value("Invalid email or password."));
        }

        @Test
        void loginWithoutCsrfIsRejected() throws Exception {
                mockMvc.perform(post("/api/admin/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginJson(EMAIL, PASSWORD)))
                                .andExpect(status().isForbidden());
        }

        @Test
        void validLoginCanAccessAdminApiAndLogoutInvalidatesSession()
                        throws Exception {

                MockHttpSession anonymousSession = new MockHttpSession();
                String anonymousSessionId = anonymousSession.getId();

                MvcResult loginResult = mockMvc.perform(post("/api/admin/login")
                                .session(anonymousSession)
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginJson(EMAIL, PASSWORD)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andReturn();

                MockHttpSession session = (MockHttpSession) loginResult
                                .getRequest()
                                .getSession(false);

                assertThat(session).isNotNull();
                assertThat(session.getId()).isNotEqualTo(anonymousSessionId);

                mockMvc.perform(get("/api/admin/me").session(session))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.email").value(EMAIL))
                                .andExpect(jsonPath("$.roles[0]").value("ROLE_ADMIN"));

                mockMvc.perform(post("/api/auth/logout")
                                .session(session)
                                .with(csrf()))
                                .andExpect(status().isNoContent());

                mockMvc.perform(get("/api/admin/me").session(session))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void disabledAccountCannotLogin() throws Exception {
                userRepository.deleteAll();

                User disabled = new User(
                                EMAIL,
                                passwordEncoder.encode(PASSWORD),
                                Role.ADMIN);

                disabled.disable();
                userRepository.saveAndFlush(disabled);

                mockMvc.perform(post("/api/admin/login")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginJson(EMAIL, PASSWORD)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.status").value(401))
                                .andExpect(jsonPath("$.error").value("Unauthorized"))
                                .andExpect(jsonPath("$.message")
                                                .value("Invalid email or password."));
        }

        @Test
        void nonAdminRoleCannotAccessAdminApi() throws Exception {
                mockMvc.perform(get("/api/admin/me")
                                .with(user("ordinary-user").roles("USER")))
                                .andExpect(status().isForbidden());
        }

        @Test
        void repeatedFailedLoginsAreRateLimited() throws Exception {
                for (int i = 0; i < LoginAttemptService.MAX_ATTEMPTS; i++) {
                        mockMvc.perform(post("/api/admin/login")
                                        .with(csrf())
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(loginJson(EMAIL, "wrong-password")))
                                        .andExpect(status().isUnauthorized());
                }

                mockMvc.perform(post("/api/admin/login")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginJson(EMAIL, PASSWORD)))
                                .andExpect(status().isTooManyRequests());
        }

        private String loginJson(String email, String password) {
                return "{\"email\":\"" + escapeJson(email)
                                + "\",\"password\":\"" + escapeJson(password) + "\"}";
        }

        private String escapeJson(String value) {
                return value
                                .replace("\\", "\\\\")
                                .replace("\"", "\\\"");
        }

        private String sha256(String value) {
                try {
                        byte[] digest = java.security.MessageDigest
                                        .getInstance("SHA-256")
                                        .digest(
                                                        value.toLowerCase(java.util.Locale.ROOT)
                                                                        .getBytes(
                                                                                        java.nio.charset.StandardCharsets.UTF_8));

                        return java.util.HexFormat.of().formatHex(digest);

                } catch (java.security.NoSuchAlgorithmException exception) {
                        throw new IllegalStateException(exception);
                }
        }
}
