package br.com.coracaomarket.cart.api;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddCartItemRequest(

    @NotNull(message = "Product is required")
    UUID productId,

    @Min(
        value = 1,
        message = "Quantity must be greater than zero"
    )
    int quantity
) {}