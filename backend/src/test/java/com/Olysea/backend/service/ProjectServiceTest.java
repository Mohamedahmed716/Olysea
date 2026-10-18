
package com.Olysea.backend.service;

import com.Olysea.backend.controller.project.dto.ProjectRequest;
import com.Olysea.backend.controller.project.dto.ProjectResponse;
import com.Olysea.backend.common.exception.ResourceNotFoundException;
import com.Olysea.backend.model.Project;
import com.Olysea.backend.repository.ProjectRepository;
import com.Olysea.backend.service.project.ProjectService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

        @Mock
        private ProjectRepository projectRepository;

        private ProjectService projectService;

        @BeforeEach
        void setUp() {
                projectService = new ProjectService(projectRepository);
        }

        @Test
        void createProjectSavesAndReturnsProject() {
                ProjectRequest request = new ProjectRequest(
                                " Olysea ",
                                " Portfolio website ",
                                "https://example.com/image.png",
                                "https://example.com");

                when(projectRepository.save(any(Project.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                ProjectResponse response = projectService.createProject(request);

                assertEquals("Olysea", response.title());
                assertEquals("Portfolio website", response.description());

                verify(projectRepository).save(any(Project.class));
        }

        @Test
        void getMissingProjectThrowsNotFound() {
                when(projectRepository.findById(99L))
                                .thenReturn(Optional.empty());

                ResourceNotFoundException exception = assertThrows(
                                ResourceNotFoundException.class,
                                () -> projectService.getProjectById(99L));

                assertEquals("Project not found.", exception.getMessage());
        }

        @Test
        void updateMissingProjectThrowsNotFound() {
                when(projectRepository.findById(99L))
                                .thenReturn(Optional.empty());

                ProjectRequest request = new ProjectRequest(
                                "Updated title",
                                "Updated description",
                                null,
                                null);

                assertThrows(
                                ResourceNotFoundException.class,
                                () -> projectService.updateProject(99L, request));

                verify(projectRepository, never()).save(any(Project.class));
        }

        @Test
        void deleteMissingProjectThrowsNotFound() {
                when(projectRepository.findById(99L))
                                .thenReturn(Optional.empty());

                assertThrows(
                                ResourceNotFoundException.class,
                                () -> projectService.deleteProject(99L));

                verify(projectRepository, never()).delete(any(Project.class));
        }
}
