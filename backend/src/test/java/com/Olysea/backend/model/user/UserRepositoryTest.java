package com.Olysea.backend.model.user;

import com.Olysea.backend.auth.Role;
import com.Olysea.backend.model.User;
import com.Olysea.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    @Test
    void shouldSaveUser() {
        User saved = userRepository.saveAndFlush(
                new User("Admin@Olysea.test", "test-hash", Role.ADMIN));

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getEmail()).isEqualTo("admin@olysea.test");
        assertThat(saved.getRole()).isEqualTo(Role.ADMIN);
        assertThat(saved.isEnabled()).isTrue();
    }

    @Test
    void shouldFindUserByEmailIgnoringCase() {
        userRepository.saveAndFlush(new User("admin@olysea.test", "test-hash", Role.ADMIN));

        Optional<User> result = userRepository.findByEmailIgnoreCase("ADMIN@OLYSEA.TEST");

        assertThat(result).isPresent();
    }

    @Test
    void shouldReturnEmptyWhenEmailDoesNotExist() {
        assertThat(userRepository.findByEmailIgnoreCase("missing@olysea.test")).isEmpty();
    }

    @Test
    void shouldCheckWhetherEmailExistsIgnoringCase() {
        userRepository.saveAndFlush(new User("admin@olysea.test", "test-hash", Role.ADMIN));

        assertThat(userRepository.existsByEmailIgnoreCase("ADMIN@OLYSEA.TEST")).isTrue();
        assertThat(userRepository.existsByEmailIgnoreCase("missing@olysea.test")).isFalse();
    }
}