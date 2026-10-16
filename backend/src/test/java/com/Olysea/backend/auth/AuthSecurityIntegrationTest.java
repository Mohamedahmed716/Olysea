package com.Olysea.backend.auth;

import com.Olysea.backend.model.User;
import com.Olysea.backend.repository.UserRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthSecurityIntegrationTest {

        private static final String EMAIL = "test-admin@olysea.test";
        private static final String PASSWORD = "Test-Only-Password-123!";

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private ObjectMapper objectMapper;

        @BeforeEach
        void setUp() {
                userRepository.findByEmailIgnoreCase(EMAIL)
                                .ifPresent(userRepository::delete);

                userRepository.save(
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
        void validCredentialsCreateAuthenticatedSession() throws Exception {
                MockHttpSession session = login(EMAIL, PASSWORD);

                mockMvc.perform(
                                get("/api/admin/me").session(session))
                                .andExpect(status().isOk());
        }

        @Test
        void invalidCredentialsAreRejected() throws Exception {
                MockHttpSession session = getCsrfSession();

                String token = csrfToken(session);

                mockMvc.perform(
                                post("/api/admin/login")
                                                .session(session)
                                                .header("X-CSRF-TOKEN", token)
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content("""
                                                                {
                                                                  "email": "test-admin@olysea.test",
                                                                  "password": "wrong-password"
                                                                }
                                                                """))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void loginWithoutCsrfTokenIsRejected() throws Exception {
                MockHttpSession session = getCsrfSession();

                mockMvc.perform(
                                post("/api/admin/login")
                                                .session(session)
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content("""
                                                                {
                                                                  "email": "test-admin@olysea.test",
                                                                  "password": "Test-Only-Password-123!"
                                                                }
                                                                """))
                                .andExpect(status().isForbidden());
        }

        private MockHttpSession login(String email, String password)
                        throws Exception {

                MockHttpSession session = getCsrfSession();
                String token = csrfToken(session);

                String body = objectMapper.writeValueAsString(
                                java.util.Map.of(
                                                "email", email,
                                                "password", password));

                mockMvc.perform(
                                post("/api/admin/login")
                                                .session(session)
                                                .header("X-CSRF-TOKEN", token)
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(body))
                                .andExpect(status().isOk());

                return session;
        }

        private MockHttpSession getCsrfSession() throws Exception {
                MvcResult result = mockMvc.perform(
                                get("/api/auth/csrf"))
                                .andExpect(status().isOk())
                                .andReturn();

                return (MockHttpSession) result.getRequest()
                                .getSession(false);
        }

        private String csrfToken(MockHttpSession session) throws Exception {
                MvcResult result = mockMvc.perform(
                                get("/api/auth/csrf").session(session))
                                .andExpect(status().isOk())
                                .andReturn();

                JsonNode json = objectMapper.readTree(
                                result.getResponse().getContentAsString());

                return json.get("token").asText();
        }
}