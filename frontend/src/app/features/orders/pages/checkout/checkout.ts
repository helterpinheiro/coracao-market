import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';

import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import {
  Subject,
  finalize,
  takeUntil
} from 'rxjs';

import { Navbar } from '../../../../shared/components/navbar/navbar';

import { AuthService } from '../../../../core/auth/services/auth';

import { CartService } from '../../../cart/services/cart';

import { OrderService } from '../../services/order';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    Navbar,
    CurrencyPipe,
    RouterLink
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();

  readonly cart = this.cartService.cart;
  readonly cartCount = this.cartService.itemCount;
  readonly total = this.cartService.total;

  readonly loading = signal(true);
  readonly processing = signal(false);

  readonly error = signal<string | null>(null);

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
    this.loading.set(true);
    this.error.set(null);

    this.cartService.loadCart()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      });
  }

  confirmOrder(): void {
    if (
      this.processing() ||
      this.loading() ||
      !this.cart()?.items.length
    ) {
      return;
    }

    this.processing.set(true);
    this.error.set(null);

    this.orderService.checkout()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.processing.set(false))
      )
      .subscribe({
        next: order => {
          // O backend altera o carrinho para CHECKED_OUT.
          // Limpamos o estado local para atualizar a navbar.
          this.cartService.clearLocalCart();

          this.router.navigate([
            '/orders',
            order.id
          ]);
        },

        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      });
  }

  private handleError(err: HttpErrorResponse): void {
    console.error('Erro no checkout:', err);

    if (err.status === 401 || err.status === 403) {
      this.authService.logout();
      this.cartService.clearLocalCart();

      this.router.navigate(['/login']);
      return;
    }

    if (err.status === 400 || err.status === 409) {
      this.error.set(
        'Não foi possível confirmar o pedido. Verifique os produtos e o estoque disponível.'
      );

      return;
    }

    this.error.set(
      'Ocorreu um erro ao processar sua solicitação. Tente novamente.'
    );
  }
}