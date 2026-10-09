import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';

import { AuthService } from '../services/auth';
import { CartService } from '../../../features/cart/services/cart';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const cartService = inject(CartService);
  const router = inject(Router);

  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  const token = authService.getToken();

  const authenticatedRequest = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Não encerra a sessão por falhas de login/cadastro.
      const isAuthEndpoint =
        req.url.startsWith('/api/auth/');

      if (
        error.status === 401 &&
        !isAuthEndpoint &&
        token &&
        authService.getToken() === token
      ) {
        authService.logout();
        cartService.clearLocalCart();

        router.navigate(['/login'], {
          queryParams: {
            returnUrl: router.url
          }
        });
      }

      return throwError(() => error);
    })
  );
};