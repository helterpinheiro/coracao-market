package br.com.coracaomarket.product.infrastructure;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.coracaomarket.product.domain.Product;

public interface ProductRepository
        extends JpaRepository<Product, UUID>,
                JpaSpecificationExecutor<Product> {

    @Modifying
    @Query("""
        UPDATE Product p
           SET p.stock = p.stock - :quantity
         WHERE p.id = :productId
           AND p.active = true
           AND p.stock >= :quantity
        """)
    int decreaseStockIfAvailable(
            @Param("productId") UUID productId,
            @Param("quantity") int quantity
    );
}