package com.codveda.backend.response;

import java.time.Instant;

public record ApiResponse<T>(
        Instant timestamp,
        String message,
        T data
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(Instant.now(), "Success", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(Instant.now(), message, data);
    }
}
