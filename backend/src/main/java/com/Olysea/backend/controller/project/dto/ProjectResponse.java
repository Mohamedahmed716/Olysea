package com.Olysea.backend.controller.project.dto;

import java.time.LocalDateTime;

public record ProjectResponse(
        Long id,
        String category,
        String name,
        String title,
        String description,
        String url,
        String projectUrl,
        String image,
        String imageUrl,
        String previewKey,
        String categoryAr,
        String descriptionAr,
        LocalDateTime createdAt
) {
    public ProjectResponse(Long id, String title, String description, String imageUrl, String projectUrl, LocalDateTime createdAt) {
        this(id, null, title, title, description, projectUrl, projectUrl, imageUrl, imageUrl, null, null, null, createdAt);
    }
}
