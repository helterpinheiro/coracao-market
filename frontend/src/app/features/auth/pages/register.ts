import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth';
import { CartService } from '../../cart/services/cart';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly returnUrl =
  this.route.snapshot.queryParamMap.get('returnUrl');

  readonly form = this.fb.nonNullable.group(
    {
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(120)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(72)
        ]
      ],

      confirmPassword: [
        '',
        [
          Validators.required
        ]
      ]
    },
    {
      validators: this.passwordsMatchValidator
    }
  );

  get name() {
    return this.form.controls.name;
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  private passwordsMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword
      ? null
      : { passwordsMismatch: true };
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(value => !value);
  }

  submit(): void {
    if (this.loading()) {
      return;
    }

    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {
      name,
      email,
      password
    } = this.form.getRawValue();

    this.loading.set(true);

    this.authService.register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    })
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          // Evita manter dados de uma sessão anterior.
          this.cartService.clearLocalCart();

          const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl');

          this.router.navigateByUrl(
            this.safeReturnUrl(returnUrl)
          );
        },

        error: (err: HttpErrorResponse) => {
          console.error('Erro ao cadastrar usuário:', err);

          if (err.status === 409) {
            this.error.set(
              'Este e-mail já está cadastrado. Tente entrar na sua conta.'
            );
            return;
          }

          if (err.status === 400) {
            const backendMessage =
              typeof err.error?.message === 'string'
                ? err.error.message
                : '';

            if (
              backendMessage.toLowerCase().includes('already registered') ||
              backendMessage.toLowerCase().includes('already exists')
            ) {
              this.error.set(
                'Este e-mail já está cadastrado. Tente entrar na sua conta.'
              );
              return;
            }

            this.error.set(
              'Verifique os dados informados e tente novamente.'
            );
            return;
          }

          this.error.set(
            'Não foi possível criar sua conta. Tente novamente.'
          );
        }
      });
  }

  private safeReturnUrl(value: string | null): string {
    if (
      value &&
      value.startsWith('/') &&
      !value.startsWith('//') &&
      !value.includes('\\') &&
      !value.startsWith('/login') &&
      !value.startsWith('/register')
    ) {
      return value;
    }

    return '/';
  }
}