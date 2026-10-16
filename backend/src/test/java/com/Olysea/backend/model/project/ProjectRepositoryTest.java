
package com.Olysea.backend.model.project;

import com.Olysea.backend.model.Project;
import com.Olysea.backend.repository.ProjectRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ProjectRepositoryTest {

    @Autowired
    private ProjectRepository projectRepository;

    @Test
    void shouldSaveAndFindProject() {
        Project project = new Project();
        project.setTitle("Olysea Website");
        project.setDescription("A portfolio website");
        project.setImageUrl("https://example.com/image.png");
        project.setProjectUrl("https://example.com");

        Project savedProject = projectRepository.saveAndFlush(project);

        assertNotNull(savedProject.getId());

        Project foundProject = projectRepository
                .findById(savedProject.getId())
                .orElseThrow();

        assertEquals("Olysea Website", foundProject.getTitle());
        assertEquals("A portfolio website", foundProject.getDescription());
        assertEquals("https://example.com", foundProject.getProjectUrl());
        assertNotNull(foundProject.getCreatedAt());
    }

    @Test
    void shouldReturnEmptyWhenProjectDoesNotExist() {
        assertTrue(projectRepository.findById(-1L).isEmpty());
    }
}
