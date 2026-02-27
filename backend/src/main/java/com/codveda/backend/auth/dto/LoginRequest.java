package com.codveda.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @Email
    @NotBlank
    @Size(max = 200)
    private String email;

    @NotBlank
    @Size(min = 8, max = 200)
    private String password;
}
