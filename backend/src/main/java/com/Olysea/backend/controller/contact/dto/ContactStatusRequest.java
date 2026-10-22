package com.Olysea.backend.controller.contact.dto;

import jakarta.validation.constraints.NotBlank;

public record ContactStatusRequest(
        @NotBlank(message = "Status is required") String status
) {
}
