package br.com.coracaomarket.order.api;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.coracaomarket.order.application.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout() {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(orderService.checkout());
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> findMyOrders() {
        return ResponseEntity.ok(
                orderService.findMyOrders()
        );
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> findMyOrder(
            @PathVariable UUID orderId
    ) {
        return ResponseEntity.ok(
                orderService.findMyOrder(orderId)
        );
    }
}