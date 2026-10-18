
package com.Olysea.backend.service;

import com.Olysea.backend.model.OlyseaService;
import com.Olysea.backend.repository.OlyseaServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ServiceManagementIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OlyseaServiceRepository serviceRepository;

    @BeforeEach
    void cleanDatabase() {
        serviceRepository.deleteAll();
    }

    @Test
    void publicCanRetrieveAllServices() throws Exception {
        createStoredService("Web Development", "Business websites");

        mockMvc.perform(get("/api/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].title", is("Web Development")));
    }

    @Test
    void publicCanRetrieveServiceById() throws Exception {
        OlyseaService service = createStoredService("UI Design", "User interface design");

        mockMvc.perform(get("/api/services/{id}", service.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(service.getId().intValue())))
                .andExpect(jsonPath("$.title", is("UI Design")));
    }

    @Test
    void missingServiceReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/services/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanCreateService() throws Exception {
        mockMvc.perform(post("/api/admin/services")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "title": "SEO",
                          "description": "Search engine optimization"
                        }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("SEO")))
                .andExpect(jsonPath("$.description",
                        is("Search engine optimization")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanUpdateService() throws Exception {
        OlyseaService service = createStoredService("Old title", "Old description");

        mockMvc.perform(put("/api/admin/services/{id}", service.getId())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "title": "New title",
                          "description": "New description"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("New title")))
                .andExpect(jsonPath("$.description", is("New description")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanDeleteService() throws Exception {
        OlyseaService service = createStoredService("Temporary", "Temporary service");

        mockMvc.perform(delete("/api/admin/services/{id}", service.getId())
                .with(csrf()))
                .andExpect(status().isNoContent());

        org.junit.jupiter.api.Assertions.assertFalse(
                serviceRepository.existsById(service.getId()));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void invalidRequestReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/admin/services")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "title": " ",
                          "description": ""
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void anonymousUserCannotCreateService() throws Exception {
        mockMvc.perform(post("/api/admin/services")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "title": "SEO",
                          "description": "Search engine optimization"
                        }
                        """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void nonAdminCannotCreateService() throws Exception {
        mockMvc.perform(post("/api/admin/services")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "title": "SEO",
                          "description": "Search engine optimization"
                        }
                        """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createWithoutCsrfTokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/admin/services")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "title": "SEO",
                          "description": "Search engine optimization"
                        }
                        """))
                .andExpect(status().isForbidden());
    }

    private OlyseaService createStoredService(
            String title,
            String description) {

        OlyseaService service = new OlyseaService();
        service.setTitle(title);
        service.setDescription(description);

        return serviceRepository.saveAndFlush(service);
    }
}
