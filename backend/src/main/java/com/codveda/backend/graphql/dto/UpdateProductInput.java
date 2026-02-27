package com.codveda.backend.graphql.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateProductInput {
    @Size(max = 180)
    private String name;

    @Size(max = 2000)
    private String description;

    @Positive
    private BigDecimal price;

    @PositiveOrZero
    private Integer stock;

    @Size(max = 1000)
    private String imageUrl;
}
