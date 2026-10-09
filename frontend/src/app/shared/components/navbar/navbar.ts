import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';

import { CartService } from '../../../features/cart/services/cart';

import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../../core/auth/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);

  @Input() cartCount = 0;
  @Input() search = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() menuToggle = new EventEmitter<void>();

  readonly currentUser = this.authService.currentUser;
  readonly isAuthenticated = this.authService.isAuthenticated;

  // Pesquisa e filtros são utilizados somente no catálogo.
  get isCatalogPage(): boolean {
    return this.router.url.split('?')[0] === '/';
  }

  onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  logout(): void {
    this.authService.logout();

    // Remove os dados do carrinho do usuário anterior.
    this.cartService.clearLocalCart();

    this.router.navigateByUrl('/');
  }
}