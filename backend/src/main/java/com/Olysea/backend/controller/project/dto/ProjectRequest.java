package com.Olysea.backend.controller.project.dto;

import jakarta.validation.constraints.Size;

public record ProjectRequest(
        @Size(max = 100, message = "Category must not exceed 100 characters") String category,
        @Size(max = 200, message = "Name must not exceed 200 characters") String name,
        @Size(max = 200, message = "Title must not exceed 200 characters") String title,
        @Size(max = 5000, message = "Description must not exceed 5000 characters") String description,
        @Size(max = 2048, message = "URL must not exceed 2048 characters") String url,
        @Size(max = 2048, message = "Project URL must not exceed 2048 characters") String projectUrl,
        String image,
        String imageUrl,
        @Size(max = 100, message = "Preview key must not exceed 100 characters") String previewKey,
        @Size(max = 100, message = "Category (Arabic) must not exceed 100 characters") String categoryAr,
        @Size(max = 5000, message = "Description (Arabic) must not exceed 5000 characters") String descriptionAr
) {
    public ProjectRequest(String title, String description, String imageUrl, String projectUrl) {
        this(null, title, title, description, projectUrl, projectUrl, imageUrl, imageUrl, null, null, null);
    }

    public String effectiveName() {
        if (name != null && !name.isBlank()) {
            return name.trim();
        }
        if (title != null && !title.isBlank()) {
            return title.trim();
        }
        return "";
    }

    public String effectiveUrl() {
        if (url != null && !url.isBlank()) {
            return url.trim();
        }
        if (projectUrl != null && !projectUrl.isBlank()) {
            return projectUrl.trim();
        }
        return null;
    }

    public String effectiveImage() {
        if (image != null && !image.isBlank()) {
            return image.trim();
        }
        if (imageUrl != null && !imageUrl.isBlank()) {
            return imageUrl.trim();
        }
        return null;
    }
}
