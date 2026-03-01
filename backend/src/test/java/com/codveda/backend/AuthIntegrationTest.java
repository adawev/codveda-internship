package com.codveda.backend;

import com.codveda.backend.model.User;
import com.codveda.backend.model.enums.Role;
import com.codveda.backend.repository.RefreshTokenRepository;
import com.codveda.backend.repository.UserRepository;
import com.codveda.backend.security.JwtService;
import com.codveda.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import jakarta.servlet.http.Cookie;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @BeforeEach
    void clean() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registerLoginAndRefreshFlowWorksWithHttpOnlyCookie() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Auth User",
                                  "email":"auth@test.local",
                                  "password":"Password@123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.message").value("User registered successfully"));

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email":"auth@test.local",
                                  "password":"Password@123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken", not(emptyOrNullString())))
                .andExpect(cookie().exists("refresh_token"))
                .andReturn();

        Cookie refreshCookie = loginResult.getResponse().getCookie("refresh_token");

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(refreshCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken", not(emptyOrNullString())))
                .andExpect(cookie().exists("refresh_token"));
    }

    @Test
    void invalidRefreshTokenIsRejected() throws Exception {
        User user = createUser("invalid-refresh@test.local", Role.USER);
        String accessToken = jwtService.generateAccessToken(user);

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie("refresh_token", accessToken)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid token type"));
    }

    private User createUser(String email, Role role) {
        User user = new User();
        user.setName(email);
        user.setEmail(email);
        user.setPassword("Password@123");
        user.setRole(role);
        return userService.save(user);
    }
}
