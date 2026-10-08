package br.com.coracaomarket.cart.api;

import br.com.coracaomarket.cart.domain.CartStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartResponse(
        UUID id,
        CartStatus status,
        List<CartItemResponse> items,
        BigDecimal total
) {
}