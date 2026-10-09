import {
  Injectable,
  inject,
  signal
} from '@angular/core';

import { HttpClient } from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest
} from '../models/auth.model';

type StoredUser = Pick<
  AuthResponse,
  'userId' | 'name' | 'email'
>;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/auth';

  private readonly tokenKey = 'coracao_market_token';
  private readonly userKey = 'coracao_market_user';

  private readonly initialSession = this.restoreSession();

  readonly currentUser = signal<StoredUser | null>(
    this.initialSession.user
  );

  readonly isAuthenticated = signal(
    this.initialSession.authenticated
  );

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(response => this.saveSession(response))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
        `${this.apiUrl}/register`,
        data
    ).pipe(
        tap(response => this.saveSession(response))
    );
    }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);

    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return null;
    }

    return token;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private saveSession(response: AuthResponse): void {
    const user: StoredUser = {
      userId: response.userId,
      name: response.name,
      email: response.email
    };

    localStorage.setItem(
      this.tokenKey,
      response.token
    );

    localStorage.setItem(
      this.userKey,
      JSON.stringify(user)
    );

    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private restoreSession(): {
    user: StoredUser | null;
    authenticated: boolean;
  } {
    const token = localStorage.getItem(this.tokenKey);
    const storedUser = localStorage.getItem(this.userKey);

    if (!token || !storedUser || this.isTokenExpired(token)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);

      return {
        user: null,
        authenticated: false
      };
    }

    try {
      const parsed = JSON.parse(storedUser) as StoredUser;

      if (
        typeof parsed.userId !== 'string' ||
        typeof parsed.name !== 'string' ||
        typeof parsed.email !== 'string'
      ) {
        throw new Error('Invalid stored user');
      }

      return {
        user: parsed,
        authenticated: true
      };
    } catch {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);

      return {
        user: null,
        authenticated: false
      };
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        return true;
      }

      const payload = JSON.parse(
        atob(
          parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(
              Math.ceil(parts[1].length / 4) * 4,
              '='
            )
        )
      );

      if (
        typeof payload.exp !== 'number' ||
        !Number.isFinite(payload.exp)
      ) {
        return true;
      }

      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}