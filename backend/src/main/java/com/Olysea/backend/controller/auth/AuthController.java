package com.Olysea.backend.controller.auth;

import com.Olysea.backend.auth.LoginAttemptService;
import com.Olysea.backend.controller.auth.dto.LoginRequest;
import com.Olysea.backend.controller.auth.dto.LoginResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;

@RestController
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final SessionAuthenticationStrategy sessionAuthenticationStrategy;
    private final LoginAttemptService loginAttemptService;

    public AuthController(
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository,
            SessionAuthenticationStrategy sessionAuthenticationStrategy,
            LoginAttemptService loginAttemptService) {
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.sessionAuthenticationStrategy = sessionAuthenticationStrategy;
        this.loginAttemptService = loginAttemptService;
    }

    @GetMapping("/api/auth/csrf")
    public CsrfToken csrf(CsrfToken csrfToken) {
        return csrfToken;
    }

    @PostMapping("/api/admin/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String ipKey = "ip:" + httpRequest.getRemoteAddr();
        String emailKey = "email:" + sha256(email);

        if (loginAttemptService.isBlocked(ipKey) || loginAttemptService.isBlocked(emailKey)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new LoginResponse(false, "Too many login attempts. Try again later."));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(email, request.password()));

            sessionAuthenticationStrategy.onAuthentication(authentication, httpRequest, httpResponse);
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, httpRequest, httpResponse);

            loginAttemptService.recordSuccess(ipKey);
            loginAttemptService.recordSuccess(emailKey);
            return ResponseEntity.ok(new LoginResponse(true, "Login successful"));
        } catch (AuthenticationException exception) {
            SecurityContextHolder.clearContext();
            loginAttemptService.recordFailure(ipKey);
            loginAttemptService.recordFailure(emailKey);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(false, "Invalid email or password"));
        }
    }

    private String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}