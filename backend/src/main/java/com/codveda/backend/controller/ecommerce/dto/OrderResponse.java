package com.codveda.backend.controller.ecommerce.dto;

import com.codveda.backend.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String userEmail;
    private BigDecimal totalPrice;
    private String shippingAddress;
    private String paymentMethod;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
