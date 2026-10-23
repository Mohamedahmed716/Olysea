package com.Olysea.backend.controller.project.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProjectRequest(
        @Size(max = 100, message = "Category must not exceed 100 characters") String category,
        @Size(max = 200, message = "Name must not exceed 200 characters") String name,
        @Size(max = 200, message = "Title must not exceed 200 characters") String title,
        @Size(max = 5000, message = "Description must not exceed 5000 characters") String description,
        @Size(max = 2048, message = "URL must not exceed 2048 characters")
        @Pattern(regexp = "^(https?://.*)?$", message = "URL must start with http:// or https://") String url,
        @Size(max = 2048, message = "Project URL must not exceed 2048 characters")
        @Pattern(regexp = "^(https?://.*)?$", message = "Project URL must start with http:// or https://") String projectUrl,
        @Size(max = 5_000_000, message = "Image must not exceed 5MB") String image,
        @Size(max = 5_000_000, message = "Image URL must not exceed 5MB") String imageUrl,
        @Size(max = 50, message = "Preview key must not exceed 50 characters")
        @Pattern(regexp = "^([a-zA-Z0-9_-]+)?$", message = "Preview key contains invalid characters") String previewKey,
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
