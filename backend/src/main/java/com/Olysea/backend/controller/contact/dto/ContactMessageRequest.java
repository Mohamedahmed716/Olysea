package com.Olysea.backend.controller.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactMessageRequest(

        @NotBlank(message = "Name is required") @Size(max = 100, message = "Name must not exceed 100 characters") String name,

        @NotBlank(message = "Email is required") @Email(message = "Email must be valid") @Size(max = 254, message = "Email must not exceed 254 characters") String email,

        @Size(max = 200, message = "Subject must not exceed 200 characters") String subject,

        @NotBlank(message = "Message is required") @Size(max = 5000, message = "Message must not exceed 5000 characters") String message

) {
}
