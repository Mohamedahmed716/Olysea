package com.Olysea.backend.controller.olyseaservice.dto;

import java.time.LocalDateTime;

public record OlyseaServiceResponse(
        Long id,
        String title,
        String description,
        String extra,
        String titleAr,
        String descriptionAr,
        String extraAr,
        LocalDateTime createdAt) {

    public OlyseaServiceResponse(Long id, String title, String description, LocalDateTime createdAt) {
        this(id, title, description, null, null, null, null, createdAt);
    }
}
