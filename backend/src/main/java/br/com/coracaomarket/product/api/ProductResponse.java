package br.com.coracaomarket.product.api;

import br.com.coracaomarket.product.domain.ProductCategory;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String description,
        ProductCategory category,
        BigDecimal price,
        int stock
) {
}
