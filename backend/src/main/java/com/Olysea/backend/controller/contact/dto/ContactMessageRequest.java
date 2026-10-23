package com.Olysea.backend.controller.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ContactMessageRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must not exceed 100 characters")
        @Pattern(regexp = "^[^\\r\\n]+$", message = "Name must not contain line breaks")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(max = 254, message = "Email must not exceed 254 characters")
        @Pattern(regexp = "^[^\\r\\n]+$", message = "Email must not contain line breaks")
        String email,

        @Size(max = 150, message = "Business name must not exceed 150 characters")
        @Pattern(regexp = "^([^\\r\\n]+)?$", message = "Business name must not contain line breaks")
        String business,

        @Size(max = 100, message = "Project type must not exceed 100 characters")
        @Pattern(regexp = "^([^\\r\\n]+)?$", message = "Project type must not contain line breaks")
        String type,

        @Size(max = 200, message = "Subject must not exceed 200 characters")
        @Pattern(regexp = "^([^\\r\\n]+)?$", message = "Subject must not contain line breaks")
        String subject,

        @NotBlank(message = "Message is required")
        @Size(max = 5000, message = "Message must not exceed 5000 characters")
        String message,

        @Size(max = 2048, message = "Honeypot value too long")
        String website

) {
    public ContactMessageRequest(String name, String email, String subject, String message) {
        this(name, email, null, null, subject, message, null);
    }

    public String effectiveSubject() {
        if (subject != null && !subject.isBlank()) {
            return subject.trim();
        }
        if (type != null && !type.isBlank()) {
            return type.trim();
        }
        return null;
    }
}
