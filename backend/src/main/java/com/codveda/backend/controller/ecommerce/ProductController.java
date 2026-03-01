package com.codveda.backend.controller.ecommerce;

import com.codveda.backend.controller.dto.product.ProductCreateRequest;
import com.codveda.backend.controller.dto.product.ProductResponse;
import com.codveda.backend.controller.dto.product.ProductUpdateRequest;
import com.codveda.backend.model.product.Product;
import com.codveda.backend.response.ApiResponse;
import com.codveda.backend.service.ecommerce.ProductService;
import jakarta.validation.Valid;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ApiResponse<Page<ProductResponse>> getProducts(
            Pageable pageable,
            Authentication authentication,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "false") boolean inStock,
            @RequestParam(required = false) Boolean active
    ) {
        if (isAdmin(authentication)) {
            return ApiResponse.success(productService.searchForAdmin(q, maxPrice, inStock, active, pageable).map(this::toResponse));
        }
        return ApiResponse.success(productService.searchForPublic(q, maxPrice, inStock, pageable).map(this::toResponse));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProduct(@PathVariable Long id, Authentication authentication) {
        Product product = isAdmin(authentication)
                ? productService.findByIdOrThrow(id)
                : productService.findActiveByIdOrThrow(id);
        return ApiResponse.success(toResponse(product));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(normalizeImageUrl(request.getImageUrl()));
        product.setActive(request.getActive());

        Product saved = productService.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Product created", toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest request) {
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
            existing.setImageUrl(normalizeImageUrl(request.getImageUrl()));
        }
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        return ApiResponse.success("Product updated", toResponse(productService.save(existing)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getImageUrl(),
                product.getActive(),
                product.getCreatedAt()
        );
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private String normalizeImageUrl(String raw) {
        if (raw == null) {
            return null;
        }

        String value = raw.trim();
        if (value.isBlank()) {
            return null;
        }

        if (value.contains("google.com/imgres") && value.contains("imgurl=")) {
            String[] parts = value.split("[?&]");
            for (String part : parts) {
                if (part.startsWith("imgurl=")) {
                    String extracted = URLDecoder.decode(part.substring("imgurl=".length()), StandardCharsets.UTF_8);
                    return extracted.isBlank() ? null : extracted;
                }
            }
        }

        return value;
    }
}
