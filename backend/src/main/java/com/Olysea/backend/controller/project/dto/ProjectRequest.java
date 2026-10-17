
package com.Olysea.backend.controller.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProjectRequest(

        @NotBlank(message = "Project title is required") @Size(max = 200, message = "Title must not exceed 200 characters") String title,

        @NotBlank(message = "Project description is required") @Size(max = 5000, message = "Description must not exceed 5000 characters") String description,

        @Size(max = 2048, message = "Image URL must not exceed 2048 characters") String imageUrl,

        @Size(max = 2048, message = "Project URL must not exceed 2048 characters") String projectUrl

) {
}
