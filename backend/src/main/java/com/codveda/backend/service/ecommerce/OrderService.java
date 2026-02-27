package com.codveda.backend.service.ecommerce;

import com.codveda.backend.exception.BadRequestException;
import com.codveda.backend.exception.NotFoundException;
import com.codveda.backend.controller.ecommerce.dto.OrderStatusEvent;
import com.codveda.backend.model.User;
import com.codveda.backend.model.cart.Cart;
import com.codveda.backend.model.cart.CartItem;
import com.codveda.backend.model.enums.OrderStatus;
import com.codveda.backend.model.order.Order;
import com.codveda.backend.model.order.OrderItem;
import com.codveda.backend.model.product.Product;
import com.codveda.backend.repository.OrderRepository;
import com.codveda.backend.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final SimpMessagingTemplate messagingTemplate;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            CartService cartService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public Order createOrder(User user) {
        Cart cart = cartService.getOrCreateCart(user);
        if (cart.getCartItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            order.getOrderItems().add(orderItem);

            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        order.setTotalPrice(total);
        Order saved = orderRepository.save(order);
        cartService.clearCart(cart);
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<Order> findOrders(User user, Pageable pageable) {
        Page<Order> orders = orderRepository.findAllByUser(user, pageable);
        orders.forEach(order -> order.getOrderItems().size());
        return orders;
    }

    @Transactional(readOnly = true)
    public Page<Order> findAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        orders.forEach(order -> order.getOrderItems().size());
        return orders;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
        order.setStatus(status);
        Order saved = orderRepository.save(order);
        messagingTemplate.convertAndSend(
                "/topic/orders/" + saved.getUser().getId(),
                new OrderStatusEvent(saved.getId(), saved.getStatus())
        );
        return saved;
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new NotFoundException("Order not found: " + orderId);
        }
        orderRepository.deleteById(orderId);
    }
}
