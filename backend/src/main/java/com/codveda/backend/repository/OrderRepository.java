package com.codveda.backend.repository;

import com.codveda.backend.model.order.Order;
import com.codveda.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByUser(User user);
    Page<Order> findAllByUser(User user, Pageable pageable);
}
