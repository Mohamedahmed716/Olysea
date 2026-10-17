
package com.Olysea.backend.service.project;

import com.Olysea.backend.model.Project;
import com.Olysea.backend.controller.project.dto.ProjectRequest;
import com.Olysea.backend.controller.project.dto.ProjectResponse;
import com.Olysea.backend.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        return toResponse(findProject(id));
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        Project project = new Project();

        project.setTitle(request.title().trim());
        project.setDescription(request.description().trim());
        project.setImageUrl(normalizeOptional(request.imageUrl()));
        project.setProjectUrl(normalizeOptional(request.projectUrl()));

        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = findProject(id);

        project.setTitle(request.title().trim());
        project.setDescription(request.description().trim());
        project.setImageUrl(normalizeOptional(request.imageUrl()));
        project.setProjectUrl(normalizeOptional(request.projectUrl()));

        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = findProject(id);
        projectRepository.delete(project);
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Project not found"));
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getImageUrl(),
                project.getProjectUrl(),
                project.getCreatedAt());
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
