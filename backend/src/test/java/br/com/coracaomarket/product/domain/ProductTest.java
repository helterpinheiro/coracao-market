package br.com.coracaomarket.product.domain;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ProductTest {

    @Test
    void shouldDecreaseStock() {
        Product product = createProduct(10);

        product.decreaseStock(3);

        assertEquals(7, product.getStock());
    }

    @Test
    void shouldNotDecreaseStockWhenQuantityIsGreaterThanAvailableStock() {
        Product product = createProduct(5);

        assertThrows(
                IllegalArgumentException.class,
                () -> product.decreaseStock(6)
        );

        assertEquals(5, product.getStock());
    }

    @Test
    void shouldNotDecreaseStockWithZeroQuantity() {
        Product product = createProduct(10);

        assertThrows(
                IllegalArgumentException.class,
                () -> product.decreaseStock(0)
        );

        assertEquals(10, product.getStock());
    }

    @Test
    void shouldNotDecreaseStockWithNegativeQuantity() {
        Product product = createProduct(10);

        assertThrows(
                IllegalArgumentException.class,
                () -> product.decreaseStock(-1)
        );

        assertEquals(10, product.getStock());
    }

    private Product createProduct(int stock) {
        return new Product(
                "Leite Integral 1L",
                "Leite integral UHT",
                ProductCategory.DAIRY,
                new BigDecimal("5.49"),
                stock
        );
    }
}