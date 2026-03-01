package com.codveda.backend.controller.ecommerce;

import com.codveda.backend.controller.ecommerce.dto.OrderItemResponse;
import com.codveda.backend.controller.ecommerce.dto.OrderResponse;
import com.codveda.backend.controller.dto.order.CreateOrderRequest;
import com.codveda.backend.controller.dto.order.UpdateOrderStatusRequest;
import com.codveda.backend.exception.UnauthorizedException;
import com.codveda.backend.model.User;
import com.codveda.backend.model.order.Order;
import com.codveda.backend.model.order.OrderItem;
import com.codveda.backend.response.ApiResponse;
import com.codveda.backend.service.UserService;
import com.codveda.backend.service.ecommerce.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
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
    public ApiResponse<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        User user = getCurrentUser();
        Order order = orderService.createOrder(user, request);
        return ApiResponse.success("Order created", toResponse(order));
    }

    @GetMapping
    public ApiResponse<Page<OrderResponse>> listOrders(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        User user = getCurrentUser();
        return ApiResponse.success(orderService.findOrders(user, pageable).map(this::toResponse));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<OrderResponse>> listOrdersForAdmin(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(orderService.findAllOrders(pageable).map(this::toResponse));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<OrderResponse> updateOrderStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ApiResponse.success("Order status updated", toResponse(orderService.updateOrderStatus(id, request.getStatus())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order deleted", null));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException("Authentication required");
        }
        String email = authentication.getName();
        return userService.findByEmailOrThrow(email);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(this::toItemResponse)
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getUser().getEmail(),
                order.getTotalPrice(),
                order.getShippingAddress(),
                order.getPaymentMethod(),
                order.getTotalAmount(),
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
