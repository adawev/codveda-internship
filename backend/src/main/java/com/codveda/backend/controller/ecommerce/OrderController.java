package com.codveda.backend.controller.ecommerce;

import com.codveda.backend.controller.ecommerce.dto.OrderItemResponse;
import com.codveda.backend.controller.ecommerce.dto.OrderResponse;
import com.codveda.backend.model.User;
import com.codveda.backend.model.order.Order;
import com.codveda.backend.model.order.OrderItem;
import com.codveda.backend.service.UserService;
import com.codveda.backend.service.ecommerce.OrderService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final UserService userService;

    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    @PostMapping
    public OrderResponse createOrder() {
        User user = getCurrentUser();
        Order order = orderService.createOrder(user);
        return toResponse(order);
    }

    @GetMapping
    public List<OrderResponse> listOrders() {
        User user = getCurrentUser();
        return orderService.findOrders(user).stream()
                .map(this::toResponse)
                .toList();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userService.findByEmail(email).orElseThrow();
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(this::toItemResponse)
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getTotalPrice(),
                order.getStatus(),
                order.getCreatedAt(),
                items
        );
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getPrice()
        );
    }
}
