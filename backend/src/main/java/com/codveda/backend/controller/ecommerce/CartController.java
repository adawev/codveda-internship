package com.codveda.backend.controller.ecommerce;

import com.codveda.backend.controller.ecommerce.dto.AddToCartRequest;
import com.codveda.backend.controller.ecommerce.dto.CartItemResponse;
import com.codveda.backend.controller.ecommerce.dto.CartResponse;
import com.codveda.backend.model.User;
import com.codveda.backend.model.cart.Cart;
import com.codveda.backend.model.cart.CartItem;
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
    public CartResponse getCart() {
        User user = getCurrentUser();
        Cart cart = cartService.getOrCreateCart(user);
        return toResponse(cart);
    }

    @PostMapping("/items")
    public CartResponse addToCart(@Valid @RequestBody AddToCartRequest request) {
        User user = getCurrentUser();
        Cart cart = cartService.addToCart(user, request.getProductId(), request.getQuantity());
        return toResponse(cart);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long itemId) {
        User user = getCurrentUser();
        cartService.removeItem(user, itemId);
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userService.findByEmail(email).orElseThrow();
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
