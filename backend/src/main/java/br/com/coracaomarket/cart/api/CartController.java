package br.com.coracaomarket.cart.api;

import br.com.coracaomarket.cart.application.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(
            CartService cartService
    ) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        return ResponseEntity.ok(
                cartService.getCurrentCart()
        );
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @Valid @RequestBody
            AddCartItemRequest request
    ) {
        return ResponseEntity.ok(
                cartService.addItem(request)
        );
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItem(
            @PathVariable UUID itemId,
            @Valid @RequestBody
            UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(
                cartService.updateItem(
                        itemId,
                        request
                )
        );
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable UUID itemId
    ) {
        return ResponseEntity.ok(
                cartService.removeItem(itemId)
        );
    }
}