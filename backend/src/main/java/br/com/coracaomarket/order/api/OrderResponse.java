package br.com.coracaomarket.order.api;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.coracaomarket.order.domain.OrderStatus;
import br.com.coracaomarket.payment.domain.PaymentStatus;

public record OrderResponse(
        UUID id,
        OrderStatus status,
        PaymentStatus paymentStatus,
        BigDecimal total,
        List<OrderItemResponse> items,
        OffsetDateTime createdAt
) {
}