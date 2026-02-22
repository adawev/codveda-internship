package com.codveda.backend.service.ecommerce;

import com.codveda.backend.model.User;
import com.codveda.backend.model.cart.Cart;
import com.codveda.backend.model.cart.CartItem;
import com.codveda.backend.model.product.Product;
import com.codveda.backend.repository.CartItemRepository;
import com.codveda.backend.repository.CartRepository;
import com.codveda.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Cart getOrCreateCart(User user) {
        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
        cart.getCartItems().size();
        return cart;
    }

    @Transactional
    public Cart addToCart(User user, Long productId, int quantity) {
        Cart cart = getOrCreateCart(user);
        Product product = productRepository.findById(productId)
                .orElseThrow();

        CartItem existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity);
            cart.getCartItems().add(item);
            cartItemRepository.save(item);
        }

        cart.getCartItems().size();
        return cart;
    }

    @Transactional
    public void removeItem(User user, Long itemId) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow();
        cart.getCartItems().removeIf(cartItem -> cartItem.getId().equals(item.getId()));
        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(Cart cart) {
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }
}
