import {
  OrderStatus,
  PaymentStatus
} from '../../orders/models/order.model';

export interface PaymentDecisionRequest {
  approved: boolean;
}

export interface PaymentResponse {
  orderId: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  amount: number;
}