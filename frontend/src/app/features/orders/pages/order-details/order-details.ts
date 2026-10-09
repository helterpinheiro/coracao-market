import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';

import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';

import { Navbar } from '../../../../shared/components/navbar/navbar';
import { AuthService } from '../../../../core/auth/services/auth';
import { CartService } from '../../../cart/services/cart';

import { OrderService } from '../../services/order';
import { Order } from '../../models/order.model';
import { PaymentService } from '../../../payments/services/payment';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    Navbar,
    CurrencyPipe,
    DatePipe,
    RouterLink
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss'
})
export class OrderDetails implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();

  readonly cartCount = this.cartService.itemCount;

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly processing = signal(false);

  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const orderId = this.route.snapshot.paramMap.get('orderId');

    if (!orderId) {
      this.router.navigate(['/']);
      return;
    }

    this.loadOrder(orderId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrder(orderId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.findMyOrder(orderId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: order => {
          this.order.set(order);
        },

        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      });
  }

  simulatePayment(approved: boolean): void {
    const currentOrder = this.order();

    if (
      !currentOrder ||
      currentOrder.paymentStatus !== 'PENDING' ||
      this.processing()
    ) {
      return;
    }

    this.processing.set(true);
    this.error.set(null);
    this.message.set(null);

    this.paymentService
      .simulatePayment(currentOrder.id, approved)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.processing.set(false))
      )
      .subscribe({
        next: response => {
          this.order.update(order => {
            if (!order) {
              return null;
            }

            return {
              ...order,
              status: response.orderStatus,
              paymentStatus: response.paymentStatus
            };
          });

          if (response.paymentStatus === 'APPROVED') {
            this.message.set(
              'Pagamento aprovado! Sua compra foi confirmada.'
            );
          } else if (response.paymentStatus === 'DECLINED') {
            this.message.set(
              'O pagamento foi recusado.'
            );
          }
        },

        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      });
  }

  private handleError(err: HttpErrorResponse): void {
    console.error('Erro ao consultar ou pagar pedido:', err);

    if (err.status === 401 || err.status === 403) {
      this.authService.logout();
      this.cartService.clearLocalCart();
      this.router.navigate(['/login']);
      return;
    }

    if (err.status === 404) {
      this.error.set(
        'Pedido não encontrado ou indisponível para esta conta.'
      );
      return;
    }

    if (err.status === 400 || err.status === 409) {
      this.error.set(
        'Não foi possível processar o pagamento. Verifique a disponibilidade dos produtos.'
      );
      return;
    }

    this.error.set(
      'Não foi possível concluir a operação. Tente novamente.'
    );
  }

  retry(): void {
  const orderId = this.route.snapshot.paramMap.get('orderId');

  if (orderId) {
    this.loadOrder(orderId);
  }
}
}