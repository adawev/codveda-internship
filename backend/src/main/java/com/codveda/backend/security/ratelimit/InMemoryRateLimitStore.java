package com.codveda.backend.security.ratelimit;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InMemoryRateLimitStore implements RateLimitStore {
    private final Map<String, Counter> counters = new ConcurrentHashMap<>();

    @Override
    public int incrementAndGet(String key, long nowMillis, long windowMs) {
        Counter updated = counters.compute(
                key,
                (k, existing) -> existing == null ? new Counter(nowMillis, 1) : existing.next(nowMillis, windowMs)
        );
        return updated.count();
    }

    private record Counter(long windowStart, int count) {
        Counter next(long now, long windowMs) {
            if (now - windowStart >= windowMs) {
                return new Counter(now, 1);
            }
            return new Counter(windowStart, count + 1);
        }
    }
}
