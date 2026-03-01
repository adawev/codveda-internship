package com.codveda.backend.security.ratelimit;

public interface RateLimitStore {
    int incrementAndGet(String key, long nowMillis, long windowMs);
}
