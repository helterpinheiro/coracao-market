import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/orders';

  checkout(): Observable<Order> {
    return this.http.post<Order>(
      `${this.apiUrl}/checkout`,
      null
    );
  }

  findMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(
      this.apiUrl
    );
  }

  findMyOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(
      `${this.apiUrl}/${orderId}`
    );
  }
}