package br.com.coracaomarket.cart.infrastructure;

import br.com.coracaomarket.cart.domain.Cart;
import br.com.coracaomarket.cart.domain.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartRepository
        extends JpaRepository<Cart, UUID> {

    Optional<Cart> findByUserIdAndStatus(
            UUID userId,
            CartStatus status
    );
}