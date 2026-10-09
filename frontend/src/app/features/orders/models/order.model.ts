export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'DECLINED';

export type PaymentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  items: OrderItem[];
  createdAt: string;
}