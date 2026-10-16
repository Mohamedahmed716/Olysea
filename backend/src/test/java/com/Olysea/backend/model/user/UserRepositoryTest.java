package com.Olysea.backend.model.user;

import com.Olysea.backend.auth.Role;
import com.Olysea.backend.model.User;
import com.Olysea.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void shouldSaveUser() {
        User user = createUser("admin@olysea.tech");

        User savedUser = userRepository.saveAndFlush(user);

        assertNotNull(savedUser.getId());
        assertEquals("admin@olysea.tech", savedUser.getEmail());
    }

    @Test
    void shouldFindUserByEmail() {
        userRepository.saveAndFlush(createUser("admin@olysea.tech"));

        Optional<User> foundUser = userRepository.findByEmailIgnoreCase("admin@olysea.tech");

        assertTrue(foundUser.isPresent());
        assertEquals("admin@olysea.tech", foundUser.get().getEmail());
    }

    @Test
    void shouldFindUserByEmailIgnoringCase() {
        userRepository.saveAndFlush(createUser("admin@olysea.tech"));

        Optional<User> foundUser = userRepository.findByEmailIgnoreCase("ADMIN@OLYSEA.TECH");

        assertTrue(foundUser.isPresent());
    }

    @Test
    void shouldReturnEmptyWhenEmailDoesNotExist() {
        Optional<User> foundUser = userRepository.findByEmailIgnoreCase("unknown@olysea.tech");

        assertTrue(foundUser.isEmpty());
    }

    @Test
    void shouldCheckWhetherEmailExists() {
        userRepository.saveAndFlush(createUser("admin@olysea.tech"));

        assertTrue(userRepository.existsByEmailIgnoreCase("admin@olysea.tech"));
        assertFalse(userRepository.existsByEmailIgnoreCase("unknown@olysea.tech"));
    }

    private User createUser(String email) {
        return new User(email, "test-hashed-password", Role.ADMIN);
    }
}