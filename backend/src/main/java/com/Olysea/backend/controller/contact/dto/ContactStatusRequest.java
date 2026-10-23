package com.Olysea.backend.controller.contact.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ContactStatusRequest(
        @NotBlank(message = "Status is required")
        @Pattern(regexp = "^(?i)(NEW|READ|REPLIED|ARCHIVED)$", message = "Status must be NEW, READ, REPLIED, or ARCHIVED")
        String status
) {
}
