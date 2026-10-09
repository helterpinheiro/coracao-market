import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import {
  AuthResponse,
  LoginRequest
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/auth';

  private readonly tokenKey = 'coracao_market_token';
  private readonly userKey = 'coracao_market_user';

  readonly currentUser = signal<AuthResponse | null>(
    this.restoreUser()
  );

  readonly isAuthenticated = signal(
    !!this.getToken()
  );

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(response => this.saveSession(response))
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);

    localStorage.setItem(
      this.userKey,
      JSON.stringify({
        userId: response.userId,
        name: response.name,
        email: response.email
      })
    );

    this.currentUser.set(response);
    this.isAuthenticated.set(true);
  }

  private restoreUser(): AuthResponse | null {
    const storedUser = localStorage.getItem(this.userKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthResponse;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}