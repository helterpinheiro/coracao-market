package br.com.coracaomarket.product.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;

import br.com.coracaomarket.product.api.ProductResponse;
import br.com.coracaomarket.product.domain.Product;
import br.com.coracaomarket.product.domain.ProductCategory;
import br.com.coracaomarket.product.infrastructure.ProductRepository;

public class ProductServiceTest {
    
    private ProductRepository productRepository;
    private ProductService productService;

    @BeforeEach
    void setUp() {
        productRepository = mock(ProductRepository.class);
        productService = new ProductService(productRepository);
    }

    @Test
    void shouldReturnProducts() {
        Product product = new Product(
                "Leite Integral 1L",
                "Leite integral UHT",
                ProductCategory.DAIRY,
                new BigDecimal("5.49"),
                60
        );

        Pageable pageable = PageRequest.of(0, 10);

        Page<Product> products = new PageImpl<>(
            List.of(product),
            pageable,
            1
        );

        when(productRepository.findAll(
            any(org.springframework.data.jpa.domain.Specification.class),
            any(Pageable.class)
        )).thenReturn(products);

        Page<ProductResponse> result = 
            productService.findAll(null, null, pageable);
        
        assertEquals(1, result.getTotalElements());
        assertEquals("Leite Integral 1L", result.getContent().getFirst().name());
        assertEquals(ProductCategory.DAIRY, result.getContent().getFirst().category());
        assertEquals(new BigDecimal("5.49"), result.getContent().getFirst().price());
    }
}
