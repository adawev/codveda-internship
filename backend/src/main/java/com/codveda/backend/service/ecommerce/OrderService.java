package com.codveda.backend.service.ecommerce;

import com.codveda.backend.exception.BadRequestException;
import com.codveda.backend.exception.NotFoundException;
import com.codveda.backend.controller.dto.order.CreateOrderRequest;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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
    public Order createOrder(User user, CreateOrderRequest request) {
        Cart cart = cartService.getOrCreateCart(user);
        if (cart.getCartItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod());

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }

            product.setStock(product.getStock() - cartItem.getQuantity());
            try {
                productRepository.saveAndFlush(product);
            } catch (ObjectOptimisticLockingFailureException ex) {
                throw new BadRequestException("Stock changed during checkout. Please retry.");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            order.getOrderItems().add(orderItem);

            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        if (request.getTotalAmount().compareTo(total) != 0) {
            throw new BadRequestException("totalAmount does not match cart total");
        }
        order.setTotalPrice(total);
        order.setTotalAmount(request.getTotalAmount());
        Order saved = orderRepository.save(order);
        messagingTemplate.convertAndSend(
                "/topic/orders/" + saved.getUser().getId(),
                new OrderStatusEvent(saved.getId(), saved.getStatus())
        );
        messagingTemplate.convertAndSend(
                "/topic/orders",
                new OrderStatusEvent(saved.getId(), saved.getStatus())
        );
        cartService.clearCart(cart);
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<Order> findOrders(User user, Pageable pageable) {
        Page<Long> idPage = orderRepository.findOrderIdsByUser(user, pageable);
        return fetchPagedOrders(idPage, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Order> findAllOrders(Pageable pageable) {
        Page<Long> idPage = orderRepository.findAllOrderIds(pageable);
        return fetchPagedOrders(idPage, pageable);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
        order.setStatus(status);
        Order saved = orderRepository.save(order);
        Order hydrated = orderRepository.findWithItemsById(saved.getId())
                .orElseThrow(() -> new NotFoundException("Order not found: " + saved.getId()));
        messagingTemplate.convertAndSend(
                "/topic/orders/" + hydrated.getUser().getId(),
                new OrderStatusEvent(hydrated.getId(), hydrated.getStatus())
        );
        messagingTemplate.convertAndSend(
                "/topic/orders",
                new OrderStatusEvent(hydrated.getId(), hydrated.getStatus())
        );
        return hydrated;
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new NotFoundException("Order not found: " + orderId);
        }
        orderRepository.deleteById(orderId);
    }

    private Page<Order> fetchPagedOrders(Page<Long> idPage, Pageable pageable) {
        if (idPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Order> hydrated = orderRepository.findAllWithItemsByIdIn(idPage.getContent());
        Map<Long, Order> byId = hydrated.stream()
                .collect(Collectors.toMap(Order::getId, Function.identity()));

        List<Order> ordered = idPage.getContent().stream()
                .map(byId::get)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

        if (ordered.size() != idPage.getContent().size()) {
            ordered = hydrated.stream()
                    .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                    .toList();
        }

        return new PageImpl<>(ordered, pageable, idPage.getTotalElements());
    }
}
