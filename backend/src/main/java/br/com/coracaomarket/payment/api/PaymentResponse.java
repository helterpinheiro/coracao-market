package br.com.coracaomarket.payment.api;

import java.math.BigDecimal;
import java.util.UUID;

import br.com.coracaomarket.order.domain.OrderStatus;
import br.com.coracaomarket.payment.domain.PaymentStatus;

public record PaymentResponse(
        UUID orderId,
        PaymentStatus paymentStatus,
        OrderStatus orderStatus,
        BigDecimal amount
) {
}