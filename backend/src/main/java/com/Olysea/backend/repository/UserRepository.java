package com.Olysea.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Olysea.backend.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}