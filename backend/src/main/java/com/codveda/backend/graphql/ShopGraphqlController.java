package com.codveda.backend.graphql;

import com.codveda.backend.controller.dto.product.ProductPageResponse;
import com.codveda.backend.controller.dto.product.ProductResponse;
import com.codveda.backend.controller.dto.order.CreateOrderRequest;
import com.codveda.backend.controller.ecommerce.dto.OrderItemResponse;
import com.codveda.backend.controller.ecommerce.dto.OrderResponse;
import com.codveda.backend.exception.UnauthorizedException;
import com.codveda.backend.graphql.dto.CreateOrderInput;
import com.codveda.backend.graphql.dto.UpdateProductInput;
import com.codveda.backend.model.User;
import com.codveda.backend.model.order.Order;
import com.codveda.backend.model.order.OrderItem;
import com.codveda.backend.model.product.Product;
import com.codveda.backend.service.UserService;
import com.codveda.backend.service.ecommerce.OrderService;
import com.codveda.backend.service.ecommerce.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class ShopGraphqlController {

    private final ProductService productService;
    private final OrderService orderService;
    private final UserService userService;

    public ShopGraphqlController(ProductService productService, OrderService orderService, UserService userService) {
        this.productService = productService;
        this.orderService = orderService;
        this.userService = userService;
    }

    @QueryMapping
    public ProductPageResponse getProducts(@Argument int page, @Argument int size) {
        Page<ProductResponse> paged = productService.findAll(PageRequest.of(page, size)).map(this::toProductResponse);
        return new ProductPageResponse(
                paged.getContent(),
                paged.getNumber(),
                paged.getSize(),
                paged.getTotalElements(),
                paged.getTotalPages()
        );
    }

    @QueryMapping
    @PreAuthorize("hasRole('USER')")
    public List<OrderResponse> getUserOrders() {
        User user = getCurrentUser();
        return orderService.findOrders(user, PageRequest.of(0, 100))
                .map(this::toOrderResponse)
                .getContent();
    }

    @MutationMapping
    @PreAuthorize("hasRole('USER')")
    public OrderResponse createOrder(@Valid @Argument CreateOrderInput input) {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setShippingAddress(input.getShippingAddress());
        request.setPaymentMethod(input.getPaymentMethod());
        request.setTotalAmount(input.getTotalAmount());
        return toOrderResponse(orderService.createOrder(getCurrentUser(), request));
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse updateProduct(@Argument Long id, @Valid @Argument UpdateProductInput input) {
        Product product = productService.findByIdOrThrow(id);

        if (input.getName() != null) {
            product.setName(input.getName());
        }
        if (input.getDescription() != null) {
            product.setDescription(input.getDescription());
        }
        if (input.getPrice() != null) {
            product.setPrice(input.getPrice());
        }
        if (input.getStock() != null) {
            product.setStock(input.getStock());
        }
        if (input.getImageUrl() != null) {
            product.setImageUrl(input.getImageUrl());
        }

        return toProductResponse(productService.save(product));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userService.findByEmailOrThrow(authentication.getName());
    }

    private ProductResponse toProductResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getImageUrl(),
                product.getActive(),
                product.getCreatedAt()
        );
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(this::toOrderItemResponse)
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

    private OrderItemResponse toOrderItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getPrice()
        );
    }
}
