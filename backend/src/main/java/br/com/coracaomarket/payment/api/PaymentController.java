package br.com.coracaomarket.payment.api;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.coracaomarket.payment.application.PaymentService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService
    ) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{orderId}/simulate")
    public ResponseEntity<PaymentResponse> simulatePayment(
            @PathVariable UUID orderId,
            @Valid @RequestBody PaymentDecisionRequest request
    ) {
        return ResponseEntity.ok(
                paymentService.processPayment(
                        orderId,
                        request.approved()
                )
        );
    }
}