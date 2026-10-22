package com.Olysea.backend.controller.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank @Email String email,

        @NotBlank String password,

        Boolean remember) {

    public LoginRequest(String email, String password) {
        this(email, password, false);
    }
}
