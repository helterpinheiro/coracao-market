import { Routes } from '@angular/router';

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
    path: '**',
    redirectTo: ''
  }
];