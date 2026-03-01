package com.codveda.backend;

import com.codveda.backend.model.User;
import com.codveda.backend.model.enums.Role;
import com.codveda.backend.repository.UserRepository;
import com.codveda.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "app.security.rate-limit.auth.max-attempts=2",
        "app.security.rate-limit.auth.window-ms=1000"
})
class AuthRateLimitIntegrationTest {
    private static final RequestPostProcessor CLIENT_IP = request -> {
        request.setRemoteAddr("203.0.113.10");
        return request;
    };

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User user = new User();
        user.setName("Rate Limit User");
        user.setEmail("ratelimit@test.local");
        user.setPassword("CorrectPassword@123");
        user.setRole(Role.USER);
        userService.save(user);
    }

    @Test
    void authRateLimiterBlocksWithinWindowAndRecoversAfterWindow() throws Exception {
        String badPasswordPayload = """
                {
                  "email":"ratelimit@test.local",
                  "password":"WrongPassword@123"
                }
                """;

        mockMvc.perform(post("/api/auth/login").with(CLIENT_IP)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badPasswordPayload))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/login").with(CLIENT_IP)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badPasswordPayload))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/login").with(CLIENT_IP)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badPasswordPayload))
                .andExpect(status().isTooManyRequests());

        Thread.sleep(1200);

        mockMvc.perform(post("/api/auth/login").with(CLIENT_IP)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badPasswordPayload))
                .andExpect(status().isUnauthorized());
    }
}
