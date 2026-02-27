package com.codveda.backend.controller.ecommerce.dto;

import com.codveda.backend.model.enums.OrderStatus;

public record OrderStatusEvent(
        Long orderId,
        OrderStatus status
) {
}
