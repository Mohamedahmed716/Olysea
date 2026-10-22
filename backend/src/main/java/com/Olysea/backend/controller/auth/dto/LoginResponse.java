package com.Olysea.backend.controller.auth.dto;

import java.util.Map;

public record LoginResponse(
        boolean success,
        String message,
        Map<String, Object> user) {

    public LoginResponse(boolean success, String message) {
        this(success, message, null);
    }
}
