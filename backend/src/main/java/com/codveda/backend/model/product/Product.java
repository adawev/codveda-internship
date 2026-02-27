package com.codveda.backend.model.product;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "products",
        indexes = {
                @Index(name = "idx_products_name", columnList = "name")
        }
)
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank
    @Size(max = 180)
    private String name;

    @Column(columnDefinition = "TEXT")
    @Size(max = 2000)
    private String description;

    @Positive
    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    @PositiveOrZero
    private Integer stock;

    @Size(max = 1000)
    @Column(length = 1000)
    private String imageUrl;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (active == null) {
            active = true;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
