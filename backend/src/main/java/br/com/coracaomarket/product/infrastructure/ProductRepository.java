package br.com.coracaomarket.product.infrastructure;

import br.com.coracaomarket.product.domain.Product;
import br.com.coracaomarket.product.domain.ProductCategory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface ProductRepository 
        extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

}
