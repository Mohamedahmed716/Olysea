package com.Olysea.backend.auth;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AdminController {

    @GetMapping("/api/admin/me")
    public Map<String, Object> currentAdmin(Authentication authentication) {
        return Map.of(
            "email", authentication.getName(),
            "roles", authentication.getAuthorities()
                .stream()
                .map(authority -> authority.getAuthority())
                .toList()
        );
    }
}