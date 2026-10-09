import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/auth/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';

  loading = signal(false);
  error = signal<string | null>(null);

  login(): void {
    if (this.loading()) {
      return;
    }

    this.error.set(null);

    if (!this.email.trim() || !this.password) {
      this.error.set('Preencha seu e-mail e sua senha.');
      return;
    }

    this.loading.set(true);

    this.authService.login({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/');
      },

      error: (err: HttpErrorResponse) => {
        this.loading.set(false);

        if (err.status === 401 || err.status === 403) {
          this.error.set('E-mail ou senha incorretos.');
        } else {
          this.error.set(
            'Não foi possível realizar o login. Tente novamente.'
          );
        }
      }
    });
  }
}