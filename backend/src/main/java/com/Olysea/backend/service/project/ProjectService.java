package com.Olysea.backend.service.project;

import com.Olysea.backend.common.exception.ResourceNotFoundException;
import com.Olysea.backend.controller.project.dto.ProjectRequest;
import com.Olysea.backend.controller.project.dto.ProjectResponse;
import com.Olysea.backend.model.Project;
import com.Olysea.backend.repository.ProjectRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAllByOrderByCreatedAtDesc()
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
        applyRequest(project, request);
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateProject(
            Long id,
            ProjectRequest request) {

        Project project = findProject(id);
        applyRequest(project, request);
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = findProject(id);
        projectRepository.delete(project);
    }

    private void applyRequest(Project project, ProjectRequest request) {
        String name = request.effectiveName();
        if (!name.isBlank()) {
            project.setName(name);
        }
        if (request.description() != null) {
            project.setDescription(request.description().trim());
        }
        project.setCategory(normalizeOptional(request.category()));
        project.setUrl(normalizeOptional(request.effectiveUrl()));
        project.setImage(normalizeOptional(request.effectiveImage()));
        project.setPreviewKey(normalizeOptional(request.previewKey()));
        project.setCategoryAr(normalizeOptional(request.categoryAr()));
        project.setDescriptionAr(normalizeOptional(request.descriptionAr()));
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Project not found."));
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getCategory(),
                project.getName(),
                project.getTitle(),
                project.getDescription(),
                project.getUrl(),
                project.getProjectUrl(),
                project.getImage(),
                project.getImageUrl(),
                project.getPreviewKey(),
                project.getCategoryAr(),
                project.getDescriptionAr(),
                project.getCreatedAt());
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
