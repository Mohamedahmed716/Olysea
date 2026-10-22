package com.Olysea.backend.controller.olyseaservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OlyseaServiceRequest(

        @NotBlank(message = "Title is required") @Size(max = 150, message = "Title must not exceed 150 characters") String title,

        @NotBlank(message = "Description is required") @Size(max = 2000, message = "Description must not exceed 2000 characters") String description,

        @Size(max = 500, message = "Extra must not exceed 500 characters") String extra,

        @Size(max = 150, message = "Title (Arabic) must not exceed 150 characters") String titleAr,

        @Size(max = 2000, message = "Description (Arabic) must not exceed 2000 characters") String descriptionAr,

        @Size(max = 500, message = "Extra (Arabic) must not exceed 500 characters") String extraAr

) {
    public OlyseaServiceRequest(String title, String description) {
        this(title, description, null, null, null, null);
    }
}
