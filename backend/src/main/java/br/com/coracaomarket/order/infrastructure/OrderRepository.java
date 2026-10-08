package br.com.coracaomarket.order.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.coracaomarket.order.domain.Order;

public interface OrderRepository
        extends JpaRepository<Order, UUID> {

    List<Order> findByUserIdOrderByCreatedAtDesc(
            UUID userId
    );

    Optional<Order> findByIdAndUserId(
            UUID orderId,
            UUID userId
    );
}