package br.com.coracaomarket.order.application;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.coracaomarket.cart.domain.Cart;
import br.com.coracaomarket.cart.domain.CartStatus;
import br.com.coracaomarket.cart.infrastructure.CartRepository;
import br.com.coracaomarket.order.api.OrderItemResponse;
import br.com.coracaomarket.order.api.OrderResponse;
import br.com.coracaomarket.order.domain.Order;
import br.com.coracaomarket.order.infrastructure.OrderRepository;
import br.com.coracaomarket.payment.domain.Payment;
import br.com.coracaomarket.payment.infrastructure.PaymentRepository;
import br.com.coracaomarket.shared.exception.BusinessException;
import br.com.coracaomarket.shared.exception.ResourceNotFoundException;
import br.com.coracaomarket.user.domain.User;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;

    public OrderService(
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            CartRepository cartRepository
    ) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.cartRepository = cartRepository;
    }

    @Transactional
    public OrderResponse checkout() {
        UUID userId = getAuthenticatedUserId();

        Cart cart = cartRepository
                .findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Active cart not found"
                        )
                );

        if (cart.getItems().isEmpty()) {
            throw new BusinessException(
                    "Cannot checkout an empty cart"
            );
        }

        Order order = new Order(userId);

        cart.getItems().forEach(cartItem -> {
            var product = cartItem.getProduct();

            if (!product.isActive()) {
                throw new BusinessException(
                        "Product is no longer available: "
                                + product.getName()
                );
            }

            if (cartItem.getQuantity() > product.getStock()) {
                throw new BusinessException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            order.addItem(
                    product.getId(),
                    product.getName(),
                    cartItem.getQuantity(),
                    product.getPrice()
            );
        });

        Order savedOrder = orderRepository.save(order);

        Payment payment = new Payment(
                savedOrder.getId(),
                savedOrder.getTotal()
        );

        paymentRepository.save(payment);

        cart.checkout();
        cartRepository.save(cart);

        return toResponse(savedOrder, payment);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> findMyOrders() {
        UUID userId = getAuthenticatedUserId();

        return orderRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(order -> {
                    Payment payment = paymentRepository
                            .findByOrderId(order.getId())
                            .orElseThrow(() ->
                                    new IllegalStateException(
                                            "Payment not found for order"
                                    )
                            );

                    return toResponse(order, payment);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse findMyOrder(UUID orderId) {
        UUID userId = getAuthenticatedUserId();

        Order order = orderRepository
                .findByIdAndUserId(orderId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"
                        )
                );

        Payment payment = paymentRepository
                .findByOrderId(order.getId())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Payment not found for order"
                        )
                );

        return toResponse(order, payment);
    }

    private OrderResponse toResponse(
            Order order,
            Payment payment
    ) {
        List<OrderItemResponse> items = order.getItems()
                .stream()
                .map(item -> new OrderItemResponse(
                        item.getProductId(),
                        item.getProductName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getStatus(),
                payment.getStatus(),
                order.getTotal(),
                items,
                order.getCreatedAt()
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