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

    @Query(
            value = """
                    SELECT p.* FROM products p
                    WHERE (:active IS NULL OR p.active = :active)
                      AND (:q IS NULL OR :q = '' OR p.name ILIKE CONCAT('%', :q, '%')
                           OR COALESCE(p.description, '') ILIKE CONCAT('%', :q, '%'))
                      AND (:maxPrice IS NULL OR p.price <= :maxPrice)
                      AND (:inStock = FALSE OR p.stock > 0)
                    """,
            countQuery = """
                    SELECT COUNT(*) FROM products p
                    WHERE (:active IS NULL OR p.active = :active)
                      AND (:q IS NULL OR :q = '' OR p.name ILIKE CONCAT('%', :q, '%')
                           OR COALESCE(p.description, '') ILIKE CONCAT('%', :q, '%'))
                      AND (:maxPrice IS NULL OR p.price <= :maxPrice)
                      AND (:inStock = FALSE OR p.stock > 0)
                    """,
            nativeQuery = true
    )
    Page<Product> search(
            @Param("active") Boolean active,
            @Param("q") String q,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("inStock") boolean inStock,
            Pageable pageable
    );
}
