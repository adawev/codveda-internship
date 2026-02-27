package com.codveda.backend.controller.dto.user;

import com.codveda.backend.model.enums.Role;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        LocalDateTime createdAt
) {
}
