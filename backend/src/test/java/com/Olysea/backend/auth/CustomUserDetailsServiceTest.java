package com.Olysea.backend.auth;

import com.Olysea.backend.model.User;
import com.Olysea.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    private CustomUserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        userDetailsService = new CustomUserDetailsService(userRepository);
    }

    @Test
    void loadUserByUsernameReturnsUserDetailsWhenActive() {
        User user = new User("admin@olysea.tech", "encoded-hash", Role.ADMIN);

        when(userRepository.findByEmailIgnoreCase("admin@olysea.tech"))
                .thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("admin@olysea.tech");

        assertThat(details.getUsername()).isEqualTo("admin@olysea.tech");
        assertThat(details.getPassword()).isEqualTo("encoded-hash");
        assertThat(details.isEnabled()).isTrue();
        assertThat(details.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_ADMIN");

        verify(userRepository).findByEmailIgnoreCase("admin@olysea.tech");
    }

    @Test
    void loadUserByUsernameTrimsEmailInput() {
        User user = new User("admin@olysea.tech", "hash", Role.ADMIN);

        when(userRepository.findByEmailIgnoreCase("admin@olysea.tech"))
                .thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("   admin@olysea.tech   ");

        assertThat(details.getUsername()).isEqualTo("admin@olysea.tech");
        verify(userRepository).findByEmailIgnoreCase("admin@olysea.tech");
    }

    @Test
    void loadUserByUsernameReturnsDisabledWhenUserNotEnabled() {
        User user = new User("disabled@olysea.tech", "hash", Role.ADMIN);
        user.disable();

        when(userRepository.findByEmailIgnoreCase("disabled@olysea.tech"))
                .thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("disabled@olysea.tech");

        assertThat(details.isEnabled()).isFalse();
    }

    @Test
    void loadUserByUsernameThrowsWhenNotFound() {
        when(userRepository.findByEmailIgnoreCase("unknown@olysea.tech"))
                .thenReturn(Optional.empty());

        assertThrows(
                UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("unknown@olysea.tech"));
    }
}
