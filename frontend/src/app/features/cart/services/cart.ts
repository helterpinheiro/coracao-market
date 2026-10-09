import {
  Injectable,
  computed,
  inject,
  signal
} from '@angular/core';

import { HttpClient } from '@angular/common/http';

import {
  Observable,
  defer,
  finalize,
  tap
} from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth';

import {
  Cart,
  AddCartItemRequest,
  UpdateCartItemRequest
} from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly apiUrl = '/api/cart';

  private sessionVersion = 0;
  private pendingLoads = 0;

  readonly cart = signal<Cart | null>(null);
  readonly loading = signal(false);

  readonly itemCount = computed(
    () =>
      this.cart()?.items.reduce(
        (total, item) => total + item.quantity,
        0
      ) ?? 0
  );

  readonly total = computed(
    () => this.cart()?.total ?? 0
  );

  loadCart(): Observable<Cart> {
    return defer(() => {
      const version = this.sessionVersion;
      const token = this.authService.getToken();

      this.pendingLoads++;
      this.loading.set(true);

      return this.http.get<Cart>(this.apiUrl).pipe(
        tap(cart => {
          if (this.isCurrentSession(version, token)) {
            this.cart.set(cart);
          }
        }),
        finalize(() => {
          if (version === this.sessionVersion) {
            this.pendingLoads = Math.max(
              0,
              this.pendingLoads - 1
            );

            this.loading.set(this.pendingLoads > 0);
          }
        })
      );
    });
  }

  addItem(
    productId: string,
    quantity = 1
  ): Observable<Cart> {
    const request: AddCartItemRequest = {
      productId,
      quantity
    };

    return this.updateCartRequest(
      this.http.post<Cart>(
        `${this.apiUrl}/items`,
        request
      )
    );
  }

  updateItem(
    itemId: string,
    quantity: number
  ): Observable<Cart> {
    const request: UpdateCartItemRequest = {
      quantity
    };

    return this.updateCartRequest(
      this.http.put<Cart>(
        `${this.apiUrl}/items/${itemId}`,
        request
      )
    );
  }

  removeItem(itemId: string): Observable<Cart> {
    return this.updateCartRequest(
      this.http.delete<Cart>(
        `${this.apiUrl}/items/${itemId}`
      )
    );
  }

  clearLocalCart(): void {
    this.sessionVersion++;
    this.pendingLoads = 0;

    this.cart.set(null);
    this.loading.set(false);
  }

  private updateCartRequest(
    request: Observable<Cart>
  ): Observable<Cart> {
    return defer(() => {
      const version = this.sessionVersion;
      const token = this.authService.getToken();

      return request.pipe(
        tap(cart => {
          if (this.isCurrentSession(version, token)) {
            this.cart.set(cart);
          }
        })
      );
    });
  }

  private isCurrentSession(
    version: number,
    token: string | null
  ): boolean {
    return (
      version === this.sessionVersion &&
      token !== null &&
      this.authService.getToken() === token
    );
  }
}