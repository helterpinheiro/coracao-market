import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';

import {
  CurrencyPipe,
  DatePipe
} from '@angular/common';

import { HttpErrorResponse } from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  Subject,
  finalize,
  takeUntil
} from 'rxjs';

import { Navbar } from '../../../../shared/components/navbar/navbar';

import { AuthService } from '../../../../core/auth/services/auth';

import { CartService } from '../../../cart/services/cart';

import { OrderService } from '../../services/order';

import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    Navbar,
    CurrencyPipe,
    DatePipe,
    RouterLink
  ],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss'
})
export class OrderHistory implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();

  readonly cartCount = this.cartService.itemCount;

  readonly orders = signal<Order[]>([]);

  readonly loading = signal(true);

  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.findMyOrders()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: orders => {
          this.orders.set(orders);
        },

        error: (err: HttpErrorResponse) => {
          console.error('Erro ao carregar pedidos:', err);

          if (err.status === 401 || err.status === 403) {
            this.authService.logout();
            this.cartService.clearLocalCart();

            this.router.navigate(['/login']);
            return;
          }

          this.error.set(
            'Não foi possível carregar seus pedidos.'
          );
        }
      });
  }

  getStatusLabel(order: Order): string {
    switch (order.status) {
      case 'PAID':
        return 'Pago';

      case 'DECLINED':
        return 'Recusado';

      default:
        return 'Aguardando pagamento';
    }
  }

  getStatusClass(order: Order): string {
    switch (order.status) {
      case 'PAID':
        return 'status-paid';

      case 'DECLINED':
        return 'status-declined';

      default:
        return 'status-pending';
    }
  }
}