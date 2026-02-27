package com.codveda.backend.controller.ecommerce;

import com.codveda.backend.controller.dto.product.ProductCreateRequest;
import com.codveda.backend.controller.dto.product.ProductResponse;
import com.codveda.backend.controller.dto.product.ProductUpdateRequest;
import com.codveda.backend.model.product.Product;
import com.codveda.backend.service.ecommerce.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public Page<ProductResponse> getProducts(Pageable pageable) {
        return productService.findAll(pageable).map(this::toResponse);
    }

    @GetMapping("/{id}")
    public ProductResponse getProduct(@PathVariable Long id) {
        return toResponse(productService.findByIdOrThrow(id));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());

        Product saved = productService.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/{id}")
    public ProductResponse updateProduct(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest request) {
        Product existing = productService.findByIdOrThrow(id);

        if (request.getName() != null) {
            existing.setName(request.getName());
        }
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            existing.setPrice(request.getPrice());
        }
        if (request.getStock() != null) {
            existing.setStock(request.getStock());
        }
        if (request.getImageUrl() != null) {
            existing.setImageUrl(request.getImageUrl());
        }

        return toResponse(productService.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getImageUrl(),
                product.getCreatedAt()
        );
    }
}
