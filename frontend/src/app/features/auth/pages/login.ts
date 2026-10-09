import {
  Component,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/auth/services/auth';
import { CartService } from '../../cart/services/cart';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly returnUrl =
    this.route.snapshot.queryParamMap.get('returnUrl');

  email = '';
  password = '';

  login(): void {
    if (this.loading()) {
      return;
    }

    this.error.set(null);

    if (!this.email.trim() || !this.password) {
      this.error.set(
        'Preencha seu e-mail e sua senha.'
      );
      return;
    }

    this.loading.set(true);

    this.authService.login({
      email: this.email.trim().toLowerCase(),
      password: this.password
    }).subscribe({
      next: () => {
        this.loading.set(false);

        // Limpa possíveis dados da sessão anterior.
        this.cartService.clearLocalCart();

        this.router.navigateByUrl(
          this.getSafeReturnUrl()
        );
      },

      error: (err: HttpErrorResponse) => {
        this.loading.set(false);

        if (
          err.status === 401 ||
          err.status === 403
        ) {
          this.error.set(
            'E-mail ou senha incorretos.'
          );

          return;
        }

        this.error.set(
          'Não foi possível realizar o login. Tente novamente.'
        );
      }
    });
  }

  private getSafeReturnUrl(): string {
    const url = this.returnUrl;

    if (
      !url ||
      !url.startsWith('/') ||
      url.startsWith('//') ||
      url.includes('\\') ||
      url.startsWith('/login') ||
      url.startsWith('/register')
    ) {
      return '/';
    }

    return url;
  }
}