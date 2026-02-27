package com.codveda.backend.controller.dto.user;

import com.codveda.backend.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Size(max = 120)
    private String name;

    @Email
    @Size(max = 200)
    private String email;

    @Size(min = 8, max = 200)
    private String password;

    private Role role;
}
