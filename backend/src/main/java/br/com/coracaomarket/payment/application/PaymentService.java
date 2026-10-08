package br.com.coracaomarket.payment.application;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.coracaomarket.order.domain.Order;
import br.com.coracaomarket.order.domain.OrderStatus;
import br.com.coracaomarket.order.infrastructure.OrderRepository;
import br.com.coracaomarket.payment.api.PaymentResponse;
import br.com.coracaomarket.payment.domain.Payment;
import br.com.coracaomarket.payment.domain.PaymentStatus;
import br.com.coracaomarket.payment.infrastructure.PaymentRepository;
import br.com.coracaomarket.product.infrastructure.ProductRepository;
import br.com.coracaomarket.shared.exception.BusinessException;
import br.com.coracaomarket.shared.exception.ResourceNotFoundException;
import br.com.coracaomarket.user.domain.User;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            ProductRepository productRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public PaymentResponse processPayment(
            UUID orderId,
            boolean approved
    ) {
        UUID userId = getAuthenticatedUserId();

        // O bloqueio é adquirido antes de verificar o status.
        Payment payment = paymentRepository
                .findByOrderIdForUpdate(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found"
                        )
                );

        Order order = orderRepository
                .findByIdAndUserId(orderId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"
                        )
                );

        // Idempotência: não processa novamente.
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return toResponse(order, payment);
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException(
                    "Order is not pending"
            );
        }

        // Simulação de pagamento recusado.
        if (!approved) {
            payment.decline();
            order.decline();

            return toResponse(order, payment);
        }

        // Verifica e desconta estoque atomicamente.
        for (var item : order.getItems()) {
            int updatedRows =
                    productRepository.decreaseStockIfAvailable(
                            item.getProductId(),
                            item.getQuantity()
                    );

            if (updatedRows != 1) {
                throw new BusinessException(
                        "Insufficient stock for product: "
                                + item.getProductName()
                );
            }
        }

        payment.approve();
        order.approve();

        return toResponse(order, payment);
    }

    private PaymentResponse toResponse(
            Order order,
            Payment payment
    ) {
        return new PaymentResponse(
                order.getId(),
                payment.getStatus(),
                order.getStatus(),
                payment.getAmount()
        );
    }

    private UUID getAuthenticatedUserId() {
        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if (authentication == null
                || !(authentication.getPrincipal() instanceof User user)) {
            throw new IllegalStateException(
                    "Authenticated user not found"
            );
        }

        return user.getId();
    }
}