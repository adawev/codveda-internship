package com.codveda.backend.graphql.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateOrderInput {
    @NotBlank
    @Size(max = 1000)
    private String shippingAddress;

    @NotBlank
    @Size(max = 50)
    private String paymentMethod;

    @NotNull
    @Positive
    private BigDecimal totalAmount;
}
