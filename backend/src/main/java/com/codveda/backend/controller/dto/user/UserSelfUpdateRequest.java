package com.codveda.backend.controller.dto.user;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class UserSelfUpdateRequest {
    @Size(max = 120)
    private String name;

    @Email
    @Size(max = 200)
    private String email;

    @Size(min = 8, max = 200)
    private String password;

    private final Map<String, Object> extraFields = new HashMap<>();

    @JsonAnySetter
    public void collectUnknownField(String key, Object value) {
        extraFields.put(key, value);
    }

    public boolean hasForbiddenRoleField() {
        return extraFields.containsKey("role");
    }
}
