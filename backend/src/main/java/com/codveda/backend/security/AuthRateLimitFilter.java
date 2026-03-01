package com.codveda.backend.security;

import com.codveda.backend.exception.ApiError;
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
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {
    private static final int LIMIT = 30;
    private static final long WINDOW_MS = 60_000;
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private final Map<String, Counter> counters = new ConcurrentHashMap<>();

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
        Counter counter = counters.compute(key, (k, existing) -> existing == null ? new Counter(now, 1) : existing.next(now));

        if (counter.count > LIMIT) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ApiError payload = new ApiError(
                    Instant.now(),
                    429,
                    "Too Many Requests",
                    "Too many authentication requests. Please retry in a minute.",
                    request.getRequestURI()
            );
            response.getWriter().write(OBJECT_MAPPER.writeValueAsString(payload));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private record Counter(long windowStart, int count) {
        Counter next(long now) {
            if (now - windowStart > WINDOW_MS) {
                return new Counter(now, 1);
            }
            return new Counter(windowStart, count + 1);
        }
    }
}
