package com.codveda.backend;

import com.codveda.backend.controller.dto.order.CreateOrderRequest;
import com.codveda.backend.model.User;
import com.codveda.backend.model.enums.Role;
import com.codveda.backend.model.product.Product;
import com.codveda.backend.repository.CartItemRepository;
import com.codveda.backend.repository.CartRepository;
import com.codveda.backend.repository.OrderRepository;
import com.codveda.backend.repository.ProductRepository;
import com.codveda.backend.repository.UserRepository;
import com.codveda.backend.security.JwtService;
import com.codveda.backend.service.UserService;
import com.codveda.backend.service.ecommerce.CartService;
import com.codveda.backend.service.ecommerce.OrderService;
import com.codveda.backend.config.ws.WebSocketAuthChannelInterceptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityHardeningIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private CartService cartService;
    @Autowired
    private OrderService orderService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private WebSocketAuthChannelInterceptor wsInterceptor;

    @BeforeEach
    void clean() {
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void selfRoleChangeAttemptIsForbidden() throws Exception {
        User user = createUser("user@test.local", Role.USER);
        String token = jwtService.generateAccessToken(user);

        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Updated User","role":"ADMIN"}
                                """))
                .andExpect(status().isForbidden());

        User updated = userService.findByEmailOrThrow(user.getEmail());
        assertThat(updated.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void websocketRejectsInvalidConnectAndUnauthorizedOrderTopicSubscription() {
        MessageChannel channel = mock(MessageChannel.class);

        StompHeaderAccessor invalidConnect = StompHeaderAccessor.create(StompCommand.CONNECT);
        invalidConnect.setNativeHeader("Authorization", "Bearer invalid.token.value");
        Message<byte[]> invalidConnectMessage = MessageBuilder.createMessage(new byte[0], invalidConnect.getMessageHeaders());
        assertThrows(AccessDeniedException.class, () -> wsInterceptor.preSend(invalidConnectMessage, channel));

        User user = createUser("socket-user@test.local", Role.USER);

        StompHeaderAccessor unauthorizedSubscribe = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        unauthorizedSubscribe.setDestination("/topic/orders/999999");
        unauthorizedSubscribe.setUser((Principal) new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                user.getAuthorities()
        ));
        Message<byte[]> unauthorizedSubscribeMessage = MessageBuilder.createMessage(new byte[0], unauthorizedSubscribe.getMessageHeaders());
        assertThrows(AccessDeniedException.class, () -> wsInterceptor.preSend(unauthorizedSubscribeMessage, channel));
    }

    @Test
    void concurrentOrdersDoNotOversellStock() throws Exception {
        Product product = new Product();
        product.setName("Concurrent Product");
        product.setDescription("test");
        product.setPrice(new BigDecimal("50.00"));
        product.setStock(1);
        product.setImageUrl("https://example.com/p.png");
        product.setActive(true);
        Product savedProduct = productRepository.save(product);

        User firstUser = createUser("first@test.local", Role.USER);
        User secondUser = createUser("second@test.local", Role.USER);
        cartService.addToCart(firstUser, savedProduct.getId(), 1);
        cartService.addToCart(secondUser, savedProduct.getId(), 1);

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        List<Boolean> successes = new ArrayList<>();
        List<Exception> failures = new ArrayList<>();

        Runnable firstTask = createOrderTask(firstUser, ready, start, successes, failures);
        Runnable secondTask = createOrderTask(secondUser, ready, start, successes, failures);

        executor.submit(firstTask);
        executor.submit(secondTask);
        ready.await();
        start.countDown();
        executor.shutdown();
        while (!executor.isTerminated()) {
            Thread.sleep(20);
        }

        Product reloaded = productRepository.findById(savedProduct.getId()).orElseThrow();
        assertThat(successes).hasSize(1);
        assertThat(failures).hasSize(1);
        assertThat(reloaded.getStock()).isEqualTo(0);
    }

    private Runnable createOrderTask(
            User user,
            CountDownLatch ready,
            CountDownLatch start,
            List<Boolean> successes,
            List<Exception> failures
    ) {
        return () -> {
            ready.countDown();
            try {
                start.await();
                CreateOrderRequest request = new CreateOrderRequest();
                request.setShippingAddress("221B Baker Street");
                request.setPaymentMethod("card");
                request.setTotalAmount(new BigDecimal("50.00"));
                orderService.createOrder(user, request);
                synchronized (successes) {
                    successes.add(Boolean.TRUE);
                }
            } catch (Exception ex) {
                synchronized (failures) {
                    failures.add(ex);
                }
            }
        };
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
