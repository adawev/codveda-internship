package com.codveda.backend;

import com.codveda.backend.model.User;
import com.codveda.backend.model.enums.Role;
import com.codveda.backend.repository.CartItemRepository;
import com.codveda.backend.repository.CartRepository;
import com.codveda.backend.repository.OrderRepository;
import com.codveda.backend.repository.ProductRepository;
import com.codveda.backend.repository.RefreshTokenRepository;
import com.codveda.backend.repository.UserRepository;
import com.codveda.backend.security.JwtService;
import com.codveda.backend.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.hasSize;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductCrudIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @BeforeEach
    void clean() {
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void adminCanCreateUpdateAndDeleteProduct() throws Exception {
        String adminToken = "Bearer " + jwtService.generateAccessToken(createUser("admin-crud@test.local", Role.ADMIN));

        MvcResult createResult = mockMvc.perform(post("/api/products")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Mechanical Keyboard",
                                  "description":"RGB keyboard",
                                  "price":199.99,
                                  "stock":12,
                                  "imageUrl":"https://example.com/kb.jpg",
                                  "active":true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Mechanical Keyboard"))
                .andReturn();

        JsonNode createBody = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long productId = createBody.path("data").path("id").asLong();

        mockMvc.perform(get("/api/products")
                        .param("q", "keyboard")
                        .param("page", "0")
                        .param("size", "5")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("Mechanical Keyboard"));

        mockMvc.perform(put("/api/products/{id}", Long.toString(productId))
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "stock":10,
                                  "price":179.99
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stock").value(10));

        mockMvc.perform(delete("/api/products/{id}", Long.toString(productId))
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Product deleted"));
    }

    @Test
    void nonAdminCannotCreateProduct() throws Exception {
        String userToken = "Bearer " + jwtService.generateAccessToken(createUser("user-crud@test.local", Role.USER));

        mockMvc.perform(post("/api/products")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Unauthorized Product",
                                  "price":100,
                                  "stock":1,
                                  "active":true
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void paginationBoundariesHandleOverflowAndInvalidSize() throws Exception {
        String adminToken = "Bearer " + jwtService.generateAccessToken(createUser("admin-pagination@test.local", Role.ADMIN));

        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/products")
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {
                                      "name":"Product %d",
                                      "description":"Page test",
                                      "price":99.99,
                                      "stock":3,
                                      "active":true
                                    }
                                    """.formatted(i)))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(get("/api/products")
                        .param("page", "50")
                        .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)));

        mockMvc.perform(get("/api/products")
                        .param("page", "0")
                        .param("size", "abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.size").value(10));
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
