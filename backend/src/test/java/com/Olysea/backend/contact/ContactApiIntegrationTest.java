
package com.Olysea.backend.contact;

import com.Olysea.backend.model.ContactRequest;
import com.Olysea.backend.repository.ContactRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ContactApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ContactRequestRepository contactRepository;

    @BeforeEach
    void cleanDatabase() {
        contactRepository.deleteAll();
    }

    @Test
    void visitorCanSubmitContactMessage() throws Exception {
        mockMvc.perform(post("/api/contact")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "Mohamed",
                          "email": "visitor@example.com",
                          "subject": "Website inquiry",
                          "message": "I would like to discuss a website."
                        }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name", is("Mohamed")))
                .andExpect(jsonPath("$.email", is("visitor@example.com")))
                .andExpect(jsonPath("$.subject", is("Website inquiry")))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    void invalidContactRequestReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/contact")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "",
                          "email": "not-an-email",
                          "subject": "",
                          "message": ""
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void contactSubmissionWithoutCsrfIsRejected() throws Exception {
        mockMvc.perform(post("/api/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "Mohamed",
                          "email": "visitor@example.com",
                          "subject": "Question",
                          "message": "Hello."
                        }
                        """))
                .andExpect(status().isForbidden());
    }

    @Test
    void anonymousUserCannotReadContactMessages() throws Exception {
        mockMvc.perform(get("/api/admin/contacts"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void nonAdminCannotReadContactMessages() throws Exception {
        mockMvc.perform(get("/api/admin/contacts"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanListContactMessages() throws Exception {
        createContact(
                "Mohamed",
                "visitor@example.com",
                "Question",
                "Hello.");

        mockMvc.perform(get("/api/admin/contacts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].name", is("Mohamed")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanGetContactById() throws Exception {
        ContactRequest contact = createContact(
                "Mohamed",
                "visitor@example.com",
                "Question",
                "Hello.");

        mockMvc.perform(get(
                "/api/admin/contacts/{id}",
                contact.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(contact.getId().intValue())))
                .andExpect(jsonPath("$.email", is("visitor@example.com")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void missingContactReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/admin/contacts/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanDeleteContact() throws Exception {
        ContactRequest contact = createContact(
                "Mohamed",
                "visitor@example.com",
                "Question",
                "Hello.");

        mockMvc.perform(delete(
                "/api/admin/contacts/{id}",
                contact.getId())
                .with(csrf()))
                .andExpect(status().isNoContent());

        assertFalse(contactRepository.existsById(contact.getId()));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteWithoutCsrfIsRejected() throws Exception {
        ContactRequest contact = createContact(
                "Mohamed",
                "visitor@example.com",
                "Question",
                "Hello.");

        mockMvc.perform(delete(
                "/api/admin/contacts/{id}",
                contact.getId()))
                .andExpect(status().isForbidden());
    }

    private ContactRequest createContact(
            String name,
            String email,
            String subject,
            String message) {

        return contactRepository.saveAndFlush(
                new ContactRequest(name, email, subject, message));
    }
}
