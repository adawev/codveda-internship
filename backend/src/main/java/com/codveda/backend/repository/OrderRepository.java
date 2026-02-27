package com.codveda.backend.repository;

import com.codveda.backend.model.order.Order;
import com.codveda.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByUser(User user);
    Page<Order> findAllByUser(User user, Pageable pageable);

    @Query("select o.id from Order o where o.user = :user")
    Page<Long> findOrderIdsByUser(@Param("user") User user, Pageable pageable);

    @Query("select o.id from Order o")
    Page<Long> findAllOrderIds(Pageable pageable);

    @Query("""
            select distinct o from Order o
            left join fetch o.user
            left join fetch o.orderItems oi
            left join fetch oi.product
            where o.id in :ids
            """)
    List<Order> findAllWithItemsByIdIn(@Param("ids") List<Long> ids);
}
