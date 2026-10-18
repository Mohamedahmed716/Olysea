package com.Olysea.backend.controller.contact.dto;

import java.time.LocalDateTime;

public record ContactMessageResponse(
        Long id,
        String name,
        String email,
        String subject,
        String message,
        LocalDateTime createdAt) {
}
