
package com.Olysea.backend.controller.OlyseaService.dto;

import java.time.LocalDateTime;

public record OlyseaServiceResponse(
        Long id,
        String title,
        String description,
        LocalDateTime createdAt) {
}
