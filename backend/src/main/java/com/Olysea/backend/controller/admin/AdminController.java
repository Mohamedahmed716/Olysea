package com.Olysea.backend.controller.admin;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AdminController {

    @GetMapping("/api/admin/me")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> currentAdmin(Authentication authentication) {
        return Map.of(
                "email", authentication.getName(),
                "roles", authentication.getAuthorities()
                        .stream()
                        .map(authority -> authority.getAuthority())
                        .toList());
    }
}
