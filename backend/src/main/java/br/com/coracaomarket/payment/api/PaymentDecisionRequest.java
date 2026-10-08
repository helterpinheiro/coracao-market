package br.com.coracaomarket.payment.api;

import jakarta.validation.constraints.NotNull;

public record PaymentDecisionRequest(
        @NotNull Boolean approved
) {
}