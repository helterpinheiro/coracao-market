package br.com.coracaomarket.cart.application;

import br.com.coracaomarket.cart.api.AddCartItemRequest;
import br.com.coracaomarket.cart.api.CartItemResponse;
import br.com.coracaomarket.cart.api.CartResponse;
import br.com.coracaomarket.cart.api.UpdateCartItemRequest;
import br.com.coracaomarket.cart.domain.Cart;
import br.com.coracaomarket.cart.domain.CartItem;
import br.com.coracaomarket.cart.domain.CartStatus;
import br.com.coracaomarket.cart.infrastructure.CartRepository;
import br.com.coracaomarket.product.domain.Product;
import br.com.coracaomarket.product.infrastructure.ProductRepository;
import br.com.coracaomarket.user.domain.User;
import br.com.coracaomarket.shared.exception.BusinessException;
import br.com.coracaomarket.shared.exception.ResourceNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartService(
            CartRepository cartRepository,
            ProductRepository productRepository
    ) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public CartResponse getCurrentCart() {
        User user = getAuthenticatedUser();

        return cartRepository
                .findByUserIdAndStatus(
                        user.getId(),
                        CartStatus.ACTIVE
                )
                .map(this::toResponse)
                .orElseGet(() ->
                        emptyCartResponse()
                );
    }

    @Transactional
    public CartResponse addItem(
            AddCartItemRequest request
    ) {
        User user = getAuthenticatedUser();

        Product product = productRepository
                .findById(request.productId())
                .filter(Product::isActive)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found"
                        )
                );

        Cart cart = cartRepository
                .findByUserIdAndStatus(
                        user.getId(),
                        CartStatus.ACTIVE
                )
                .orElseGet(() ->
                        new Cart(user)
                );

        CartItem existingItem = cart
                .findItemByProductId(product.getId())
                .orElse(null);

        int resultingQuantity =
                request.quantity();

        if (existingItem != null) {
            resultingQuantity +=
                    existingItem.getQuantity();
        }

        validateStock(
                product,
                resultingQuantity
        );

        if (existingItem == null) {
            CartItem item = new CartItem(
                    cart,
                    product,
                    request.quantity()
            );

            cart.addItem(item);
        } else {
            existingItem.increaseQuantity(
                    request.quantity()
            );
        }

        Cart savedCart =
                cartRepository.save(cart);

        return toResponse(savedCart);
    }

    @Transactional
    public CartResponse updateItem(
            UUID itemId,
            UpdateCartItemRequest request
    ) {
        Cart cart = getActiveCart();

        CartItem item = findItem(
                cart,
                itemId
        );

        validateStock(
                item.getProduct(),
                request.quantity()
        );

        item.changeQuantity(
                request.quantity()
        );

        Cart savedCart =
                cartRepository.save(cart);

        return toResponse(savedCart);
    }

    @Transactional
    public CartResponse removeItem(UUID itemId) {
        Cart cart = getActiveCart();

        CartItem item = findItem(
                cart,
                itemId
        );

        cart.removeItem(item);

        Cart savedCart =
                cartRepository.save(cart);

        return toResponse(savedCart);
    }

    private Cart getActiveCart() {
        User user = getAuthenticatedUser();

        return cartRepository
                .findByUserIdAndStatus(
                    user.getId(),
                    CartStatus.ACTIVE
                )
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Active cart not found"
                    )
                );
    }

    private CartItem findItem(
            Cart cart,
            UUID itemId
    ) {
        return cart.getItems()
            .stream()
            .filter(item ->
                item.getId().equals(itemId)
            )
            .findFirst()
            .orElseThrow(() ->
                new ResourceNotFoundException(
                        "Cart item not found"
                )
            );
    }

    private void validateStock(
            Product product,
            int quantity
    ) {
        if (quantity > product.getStock()) {
            throw new BusinessException(
                    "Insufficient stock"
            );
        }
    }

    private User getAuthenticatedUser() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal()
                instanceof User user)) {

            throw new IllegalStateException(
                    "Authenticated user not found"
            );
        }

        return user;
    }

    private CartResponse toResponse(Cart cart) {
        var items = cart.getItems()
                .stream()
                .map(item ->
                        new CartItemResponse(
                                item.getId(),
                                item.getProduct().getId(),
                                item.getProduct().getName(),
                                item.getProduct().getPrice(),
                                item.getQuantity(),
                                item.getSubtotal()
                        )
                )
                .toList();

        return new CartResponse(
                cart.getId(),
                cart.getStatus(),
                items,
                cart.getTotal()
        );
    }

    private CartResponse emptyCartResponse() {
        return new CartResponse(
                null,
                CartStatus.ACTIVE,
                java.util.List.of(),
                java.math.BigDecimal.ZERO
        );
    }
}