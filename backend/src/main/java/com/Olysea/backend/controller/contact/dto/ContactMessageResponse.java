package com.Olysea.backend.controller.contact.dto;

import java.time.LocalDateTime;

public record ContactMessageResponse(
        Long id,
        String name,
        String email,
        String business,
        String type,
        String subject,
        String message,
        String status,
        LocalDateTime createdAt
) {
    public ContactMessageResponse(Long id, String name, String email, String subject, String message, LocalDateTime createdAt) {
        this(id, name, email, null, subject, subject, message, "NEW", createdAt);
    }
}
