package com.Olysea.backend.controller.auth.dto;

public record LoginResponse(
        boolean success,
        String message) {
}