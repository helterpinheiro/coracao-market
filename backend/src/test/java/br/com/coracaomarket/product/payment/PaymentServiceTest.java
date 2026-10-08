package br.com.coracaomarket.product.payment;

import br.com.coracaomarket.order.domain.Order;
import br.com.coracaomarket.order.domain.OrderStatus;
import br.com.coracaomarket.order.infrastructure.OrderRepository;
import br.com.coracaomarket.payment.application.PaymentService;
import br.com.coracaomarket.payment.domain.Payment;
import br.com.coracaomarket.payment.domain.PaymentStatus;
import br.com.coracaomarket.payment.infrastructure.PaymentRepository;
import br.com.coracaomarket.product.infrastructure.ProductRepository;
import br.com.coracaomarket.shared.exception.BusinessException;
import br.com.coracaomarket.user.domain.User;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private PaymentService paymentService;

    private UUID userId;
    private UUID productId;
    private Order order;
    private Payment payment;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        productId = UUID.randomUUID();

        User user = mock(User.class);
        when(user.getId()).thenReturn(userId);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        user,
                        null
                )
        );

        order = new Order(userId);
        order.addItem(
                productId,
                "Arroz Tipo 1 5kg",
                4,
                new BigDecimal("24.90")
        );

        payment = new Payment(
                order.getId(),
                order.getTotal()
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldApprovePaymentAndDecreaseStock() {
        mockOrderAndPayment();

        when(productRepository.decreaseStockIfAvailable(
                productId,
                4
        )).thenReturn(1);

        var response = paymentService.processPayment(
                order.getId(),
                true
        );

        assertEquals(
                PaymentStatus.APPROVED,
                response.paymentStatus()
        );

        assertEquals(
                OrderStatus.PAID,
                response.orderStatus()
        );

        verify(productRepository, times(1))
                .decreaseStockIfAvailable(productId, 4);
    }

    @Test
    void shouldDeclinePaymentWithoutDecreasingStock() {
        mockOrderAndPayment();

        var response = paymentService.processPayment(
                order.getId(),
                false
        );

        assertEquals(
                PaymentStatus.DECLINED,
                response.paymentStatus()
        );

        assertEquals(
                OrderStatus.DECLINED,
                response.orderStatus()
        );

        verifyNoInteractions(productRepository);
    }

    @Test
    void shouldNotDecreaseStockTwice() {
        mockOrderAndPayment();

        when(productRepository.decreaseStockIfAvailable(
                productId,
                4
        )).thenReturn(1);

        paymentService.processPayment(
                order.getId(),
                true
        );

        paymentService.processPayment(
                order.getId(),
                true
        );

        verify(productRepository, times(1))
                .decreaseStockIfAvailable(productId, 4);
    }

    @Test
    void shouldRejectPaymentWhenStockIsInsufficient() {
        mockOrderAndPayment();

        when(productRepository.decreaseStockIfAvailable(
                productId,
                4
        )).thenReturn(0);

        assertThrows(
                BusinessException.class,
                () -> paymentService.processPayment(
                        order.getId(),
                        true
                )
        );

        assertEquals(
                PaymentStatus.PENDING,
                payment.getStatus()
        );

        assertEquals(
                OrderStatus.PENDING,
                order.getStatus()
        );
    }

    private void mockOrderAndPayment() {
        when(paymentRepository.findByOrderIdForUpdate(
                order.getId()
        )).thenReturn(Optional.of(payment));

        when(orderRepository.findByIdAndUserId(
                order.getId(),
                userId
        )).thenReturn(Optional.of(order));
    }
}