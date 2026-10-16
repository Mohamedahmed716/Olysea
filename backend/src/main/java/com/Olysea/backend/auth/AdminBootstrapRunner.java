package com.Olysea.backend.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.Olysea.backend.model.User;
import com.Olysea.backend.repository.UserRepository;

import java.util.Locale;

@Component
@ConditionalOnProperty(prefix = "olysea.bootstrap-admin", name = "enabled", havingValue = "true")
public class AdminBootstrapRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrapRunner(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        String email = System.getenv("ADMIN_EMAIL");
        String password = System.getenv("ADMIN_PASSWORD");

        if (email == null || email.isBlank()) {
            throw new IllegalStateException(
                    "ADMIN_EMAIL is required for admin bootstrap");
        }

        if (password == null || password.length() < 16) {
            throw new IllegalStateException(
                    "ADMIN_PASSWORD must contain at least 16 characters");
        }

        email = email.trim().toLowerCase(Locale.ROOT);

        var existingUser = userRepository.findByEmailIgnoreCase(email);

        if (existingUser.isPresent()) {
            if (existingUser.get().getRole() != Role.ADMIN) {
                throw new IllegalStateException(
                        "The bootstrap email already belongs to a non-admin user");
            }

            return;
        }

        User admin = new User(
                email,
                passwordEncoder.encode(password),
                Role.ADMIN);

        userRepository.save(admin);
    }
}