package com.codveda.backend.controller.ecommerce;

import com.codveda.backend.controller.ecommerce.dto.AddToCartRequest;
import com.codveda.backend.controller.ecommerce.dto.CartItemResponse;
import com.codveda.backend.controller.ecommerce.dto.CartResponse;
import com.codveda.backend.exception.UnauthorizedException;
import com.codveda.backend.model.User;
import com.codveda.backend.model.cart.Cart;
import com.codveda.backend.model.cart.CartItem;
import com.codveda.backend.response.ApiResponse;
import com.codveda.backend.service.UserService;
import com.codveda.backend.service.ecommerce.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;
    private final UserService userService;

    public CartController(CartService cartService, UserService userService) {
        this.cartService = cartService;
        this.userService = userService;
    }

    @GetMapping
    public ApiResponse<CartResponse> getCart() {
        User user = getCurrentUser();
        Cart cart = cartService.getOrCreateCart(user);
        return ApiResponse.success(toResponse(cart));
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addToCart(@Valid @RequestBody AddToCartRequest request) {
        User user = getCurrentUser();
        Cart cart = cartService.addToCart(user, request.getProductId(), request.getQuantity());
        return ApiResponse.success("Cart updated", toResponse(cart));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(@PathVariable Long itemId) {
        User user = getCurrentUser();
        cartService.removeItem(user, itemId);
        return ResponseEntity.ok(ApiResponse.success("Cart item removed", null));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException("Authentication required");
        }
        String email = authentication.getName();
        return userService.findByEmailOrThrow(email);
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getCartItems().stream()
                .map(this::toItemResponse)
                .toList();
        return new CartResponse(cart.getId(), items);
    }

    private CartItemResponse toItemResponse(CartItem item) {
        return new CartItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getPrice(),
                item.getQuantity()
        );
    }
}
