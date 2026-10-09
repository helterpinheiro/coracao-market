import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  PaymentDecisionRequest,
  PaymentResponse
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/payments';

  simulatePayment(
    orderId: string,
    approved: boolean
  ): Observable<PaymentResponse> {
    const request: PaymentDecisionRequest = {
      approved
    };

    return this.http.post<PaymentResponse>(
      `${this.apiUrl}/${orderId}/simulate`,
      request
    );
  }
}