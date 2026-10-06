package br.com.coracaomarket.product.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import br.com.coracaomarket.product.api.ProductResponse;
import br.com.coracaomarket.product.domain.Product;
import br.com.coracaomarket.product.domain.ProductCategory;
import br.com.coracaomarket.product.infrastructure.ProductRepository;
import br.com.coracaomarket.product.infrastructure.ProductSpecifications;

@Service
public class ProductService {
    
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<ProductResponse> findAll(
        String name, 
        ProductCategory category,
        Pageable pageable
    ) {
        Specification<Product> specification = 
            ProductSpecifications.isActive();
        
        if (category != null) {
            specification = specification.and(
                ProductSpecifications.hasCategory(category)
            );
        }

        if (name != null && !name.isBlank()) {
            specification = specification.and(
                ProductSpecifications.nameContains(name)
        );
    }


    return productRepository
            .findAll(specification, pageable)
            .map(this::toResponse);
    } 

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getCategory(),
            product.getPrice(),
            product.getStock()
        );
    }
}
