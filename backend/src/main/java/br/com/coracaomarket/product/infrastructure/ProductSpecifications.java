package br.com.coracaomarket.product.infrastructure;

import org.springframework.data.jpa.domain.Specification;

import br.com.coracaomarket.product.domain.Product;
import br.com.coracaomarket.product.domain.ProductCategory;

public class ProductSpecifications {
    
    private ProductSpecifications() {}

    public static Specification<Product> isActive() {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.isTrue(root.get("active"));
    }

    public static Specification<Product> hasCategory(
        ProductCategory category
    ) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(
                root.get("category"),
                category
            );
    }

    public static Specification<Product> nameContains(
        String name
    ) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.like(
                criteriaBuilder.lower(root.get("name")), 
                "%" + name.toLowerCase() + "%"
            );
    }
}
