package com.codveda.backend.service.ecommerce;

import com.codveda.backend.exception.NotFoundException;
import com.codveda.backend.exception.BadRequestException;
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
        Cart cart = cartRepository.findByUserWithItemsAndProducts(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
        return cartRepository.findByUserWithItemsAndProducts(user).orElse(cart);
    }

    @Transactional
    public Cart addToCart(User user, Long productId, int quantity) {
        Cart cart = getOrCreateCart(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productId));
        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BadRequestException("Product is inactive");
        }
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be at least 1");
        }

        CartItem existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            int nextQuantity = existingItem.getQuantity() + quantity;
            if (nextQuantity > product.getStock()) {
                throw new BadRequestException("Requested quantity exceeds current stock");
            }
            existingItem.setQuantity(nextQuantity);
            cartItemRepository.save(existingItem);
        } else {
            if (quantity > product.getStock()) {
                throw new BadRequestException("Requested quantity exceeds current stock");
            }
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity);
            cart.getCartItems().add(item);
            cartItemRepository.save(item);
        }

        return cartRepository.findByUserWithItemsAndProducts(user).orElse(cart);
    }

    @Transactional
    public void removeItem(User user, Long itemId) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new NotFoundException("Cart item not found: " + itemId));
        cart.getCartItems().removeIf(cartItem -> cartItem.getId().equals(item.getId()));
        cartItemRepository.delete(item);
    }

    @Transactional
    public Cart updateItemQuantity(User user, Long itemId, int quantity) {
        Cart cart = getOrCreateCart(user);
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be at least 1");
        }

        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new NotFoundException("Cart item not found: " + itemId));

        Product product = item.getProduct();
        if (quantity > product.getStock()) {
            throw new BadRequestException("Requested quantity exceeds current stock");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return cartRepository.findByUserWithItemsAndProducts(user).orElse(cart);
    }

    @Transactional
    public void clearCart(Cart cart) {
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }
}
