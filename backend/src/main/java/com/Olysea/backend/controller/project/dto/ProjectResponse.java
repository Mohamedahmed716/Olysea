
package com.Olysea.backend.controller.project.dto;

import java.time.LocalDateTime;

public record ProjectResponse(
        Long id,
        String title,
        String description,
        String imageUrl,
        String projectUrl,
        LocalDateTime createdAt) {
}
