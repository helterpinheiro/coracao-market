import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';

import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Navbar } from '../../../../shared/components/navbar/navbar';
import { AuthService } from '../../../../core/auth/services/auth';
import { CartService } from '../../services/cart';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    Navbar,
    CurrencyPipe,
    RouterLink
  ],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss'
})
export class CartPage implements OnInit, OnDestroy {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();

  readonly cart = this.cartService.cart;
  readonly cartCount = this.cartService.itemCount;
  readonly total = this.cartService.total;
  readonly loading = this.cartService.loading;

  readonly items = computed(() =>
    this.cart()?.items ?? []
  );

  readonly updatingItemId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCart(): void {
    this.error.set(null);

    this.cartService.loadCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      });
  }

  increaseQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      return;
    }

    this.updateQuantity(item, item.quantity - 1);
  }

  private updateQuantity(
    item: CartItem,
    quantity: number
  ): void {
    if (this.updatingItemId() !== null) {
      return;
    }

    this.error.set(null);
    this.message.set(null);

    this.updatingItemId.set(item.id);

    this.cartService.updateItem(item.id, quantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.updatingItemId.set(null);

          this.message.set(
            'Quantidade atualizada com sucesso!'
          );
        },

        error: (err: HttpErrorResponse) => {
          this.updatingItemId.set(null);
          this.handleError(err);
        }
      });
  }

  removeItem(item: CartItem): void {
    if (this.updatingItemId() !== null) {
      return;
    }

    this.error.set(null);
    this.message.set(null);

    this.updatingItemId.set(item.id);

    this.cartService.removeItem(item.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.updatingItemId.set(null);

          this.message.set(
            `${item.productName} foi removido do carrinho.`
          );
        },

        error: (err: HttpErrorResponse) => {
          this.updatingItemId.set(null);
          this.handleError(err);
        }
      });
  }

  private handleError(err: HttpErrorResponse): void {
    console.error('Erro no carrinho:', err);

    if (err.status === 401 || err.status === 403) {
      this.authService.logout();
      this.cartService.clearLocalCart();

      this.router.navigate(['/login']);
      return;
    }

    if (err.status === 400 || err.status === 409) {
      this.error.set(
        'Não foi possível atualizar o carrinho. Verifique a quantidade disponível.'
      );
      return;
    }

    this.error.set(
      'Não foi possível realizar a operação. Tente novamente.'
    );
  }
}