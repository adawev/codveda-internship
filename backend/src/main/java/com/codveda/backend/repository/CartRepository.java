package com.codveda.backend.repository;

import com.codveda.backend.model.cart.Cart;
import com.codveda.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);

    @Query("""
            select distinct c from Cart c
            left join fetch c.cartItems ci
            left join fetch ci.product
            where c.user = :user
            """)
    Optional<Cart> findByUserWithItemsAndProducts(@Param("user") User user);
}
