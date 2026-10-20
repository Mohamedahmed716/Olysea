
package com.Olysea.backend.controller.olyseaservice.dto;

import java.time.LocalDateTime;

public record OlyseaServiceResponse(
                Long id,
                String title,
                String description,
                LocalDateTime createdAt) {
}
