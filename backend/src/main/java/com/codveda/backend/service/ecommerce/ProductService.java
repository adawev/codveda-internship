package com.codveda.backend.service.ecommerce;

import com.codveda.backend.model.product.Product;
import com.codveda.backend.exception.NotFoundException;
import com.codveda.backend.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product save(Product product) {
        return productRepository.save(product);
    }

    @Cacheable("products")
    public Page<Product> findAll(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    @Cacheable("products")
    public Page<Product> findActive(Pageable pageable) {
        return productRepository.findAllByActiveTrue(pageable);
    }

    @Cacheable("products")
    public Page<Product> searchForPublic(String q, BigDecimal maxPrice, boolean inStock, Pageable pageable) {
        return productRepository.search(true, q, maxPrice, inStock, pageable);
    }

    @Cacheable("products")
    public Page<Product> searchForAdmin(String q, BigDecimal maxPrice, boolean inStock, Boolean active, Pageable pageable) {
        return productRepository.search(active, q, maxPrice, inStock, pageable);
    }

    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    public Product findByIdOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
    }

    public Product findActiveByIdOrThrow(Long id) {
        return productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deleteById(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }
}
