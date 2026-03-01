package com.codveda.backend.repository;

import com.codveda.backend.model.product.Product;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findAllByActiveTrue(Pageable pageable);
    Optional<Product> findByIdAndActiveTrue(Long id);

    @Query("""
            select p from Product p
            where (:active is null or p.active = :active)
              and (:q is null or :q = '' or lower(p.name) like lower(concat('%', :q, '%'))
                   or lower(coalesce(p.description, '')) like lower(concat('%', :q, '%')))
              and (:maxPrice is null or p.price <= :maxPrice)
              and (:inStock = false or p.stock > 0)
            """)
    Page<Product> search(
            @Param("active") Boolean active,
            @Param("q") String q,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("inStock") boolean inStock,
            Pageable pageable
    );
}
