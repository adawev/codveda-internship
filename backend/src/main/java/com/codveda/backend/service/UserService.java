package com.codveda.backend.service;


import com.codveda.backend.exception.ConflictException;
import com.codveda.backend.exception.NotFoundException;
import com.codveda.backend.model.User;
import com.codveda.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User save(User user) {
        userRepository.findByEmail(user.getEmail())
                .filter(existing -> user.getId() == null || !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new ConflictException("Email already registered");
                });

        if (user.getPassword() != null && !isEncoded(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    public Page<User> findAll(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void deleteById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }

    public User findByIdOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    public User findByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));
    }

    private boolean isEncoded(String value) {
        return value.startsWith(\"$2a$\") || value.startsWith(\"$2b$\") || value.startsWith(\"$2y$\");
    }
}
