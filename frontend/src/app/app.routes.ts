import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/products/pages/product-list/product-list')
        .then(m => m.ProductList)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../app/features/auth/pages/login')
        .then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register')
        .then(m => m.Register)
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/cart/pages/cart-page/cart-page')
        .then(m => m.CartPage)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/pages/checkout/checkout')
        .then(m => m.Checkout)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/pages/order-history/order-history')
        .then(m => m.OrderHistory)
  },
  {
    path: 'orders/:orderId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/pages/order-details/order-details')
        .then(m => m.OrderDetails)
  },
  {
    path: '**',
    redirectTo: ''
  }
];