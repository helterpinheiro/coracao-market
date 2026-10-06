package br.com.coracaomarket.product.api;

import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.coracaomarket.product.application.ProductService;
import br.com.coracaomarket.product.domain.ProductCategory;
import br.com.coracaomarket.shared.api.PageResponse;

@RestController 
@RequestMapping("/api/products")
public class ProductController {
    
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public PageResponse<ProductResponse> findAll(
        @RequestParam(required = false) String name,
        @RequestParam(required = false) ProductCategory category,
        Pageable pageable  
    ) {
        return PageResponse.from(
            productService.findAll(name, category, pageable)
        );
    }
}
