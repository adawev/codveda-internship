package com.codveda.backend.security;

import com.codveda.backend.exception.ApiError;
import com.codveda.backend.security.ratelimit.RateLimitStore;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {
    private final ObjectMapper objectMapper;
    private final RateLimitStore rateLimitStore;
    private final int maxAttempts;
    private final long windowMs;

    public AuthRateLimitFilter(
            RateLimitStore rateLimitStore,
            ObjectMapper objectMapper,
            @org.springframework.beans.factory.annotation.Value("${app.security.rate-limit.auth.max-attempts:30}") int maxAttempts,
            @org.springframework.beans.factory.annotation.Value("${app.security.rate-limit.auth.window-ms:60000}") long windowMs
    ) {
        this.rateLimitStore = rateLimitStore;
        this.objectMapper = objectMapper;
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !(path.startsWith("/api/auth/login")
                || path.startsWith("/api/auth/register")
                || path.startsWith("/api/auth/refresh"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String key = request.getRemoteAddr() + ":" + request.getRequestURI();
        long now = System.currentTimeMillis();
        int attempts = rateLimitStore.incrementAndGet(key, now, windowMs);

        if (attempts > maxAttempts) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ApiError payload = new ApiError(
                    Instant.now(),
                    429,
                    "Too Many Requests",
                    "Too many authentication requests. Please retry in a minute.",
                    request.getRequestURI()
            );
            response.getWriter().write(objectMapper.writeValueAsString(payload));
            return;
        }

        filterChain.doFilter(request, response);
    }
}
