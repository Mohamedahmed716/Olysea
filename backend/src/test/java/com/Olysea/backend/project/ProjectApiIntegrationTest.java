package com.Olysea.backend.project;

import com.Olysea.backend.model.Project;
import com.Olysea.backend.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProjectRepository projectRepository;

    @BeforeEach
    void cleanDatabase() {
        projectRepository.deleteAll();
    }

    @Test
    void publicCanRetrieveAllProjects() throws Exception {
        createStoredProject("Olysea Platform", "Digital platform for modern businesses.");

        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].name", is("Olysea Platform")))
                .andExpect(jsonPath("$[0].title", is("Olysea Platform")));
    }

    @Test
    void publicCanRetrieveProjectById() throws Exception {
        Project project = createStoredProject("HealthCare App", "Telemedicine management suite.");

        mockMvc.perform(get("/api/projects/{id}", project.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(project.getId().intValue())))
                .andExpect(jsonPath("$.name", is("HealthCare App")))
                .andExpect(jsonPath("$.description", is("Telemedicine management suite.")));
    }

    @Test
    void missingProjectReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/projects/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanCreateProject() throws Exception {
        mockMvc.perform(post("/api/admin/projects")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "category": "Web Application",
                                  "name": "Cloud Dashboard",
                                  "description": "Enterprise cloud analytics platform.",
                                  "url": "https://dashboard.example.com",
                                  "image": "https://example.com/image.jpg",
                                  "previewKey": "analytics"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Cloud Dashboard")))
                .andExpect(jsonPath("$.category", is("Web Application")))
                .andExpect(jsonPath("$.url", is("https://dashboard.example.com")))
                .andExpect(jsonPath("$.previewKey", is("analytics")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanUpdateProject() throws Exception {
        Project project = createStoredProject("Old Project", "Old description");

        mockMvc.perform(put("/api/admin/projects/{id}", project.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "category": "E-Commerce",
                                  "name": "Updated Store",
                                  "description": "Updated e-commerce solution.",
                                  "url": "https://store.example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(project.getId().intValue())))
                .andExpect(jsonPath("$.name", is("Updated Store")))
                .andExpect(jsonPath("$.category", is("E-Commerce")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanDeleteProject() throws Exception {
        Project project = createStoredProject("Temporary Project", "To be deleted.");

        mockMvc.perform(delete("/api/admin/projects/{id}", project.getId())
                        .with(csrf()))
                .andExpect(status().isNoContent());

        assertFalse(projectRepository.existsById(project.getId()));
    }

    @Test
    void anonymousUserCannotCreateProject() throws Exception {
        mockMvc.perform(post("/api/admin/projects")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Unauthorized Project",
                                  "description": "Should fail."
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void nonAdminCannotCreateProject() throws Exception {
        mockMvc.perform(post("/api/admin/projects")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Forbidden Project",
                                  "description": "Should be forbidden."
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createProjectWithoutCsrfIsRejected() throws Exception {
        mockMvc.perform(post("/api/admin/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "CSRF Project",
                                  "description": "Missing CSRF token."
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteProjectWithoutCsrfIsRejected() throws Exception {
        Project project = createStoredProject("Protected Project", "CSRF protected.");

        mockMvc.perform(delete("/api/admin/projects/{id}", project.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void invalidUrlFailsValidation() throws Exception {
        mockMvc.perform(post("/api/admin/projects")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Valid Name",
                                  "description": "Valid description.",
                                  "url": "ftp://invalid-url"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.fields.url").exists());
    }

    private Project createStoredProject(String name, String description) {
        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setCategory("Development");
        return projectRepository.saveAndFlush(project);
    }
}
