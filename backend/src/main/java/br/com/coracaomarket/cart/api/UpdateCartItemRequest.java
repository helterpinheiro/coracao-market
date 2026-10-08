package br.com.coracaomarket.cart.api;

import jakarta.validation.constraints.Min;

public record UpdateCartItemRequest(

    @Min(
        value = 1,
        message = "Quantity must be greater than zero"
    )
    int quantity

) {}