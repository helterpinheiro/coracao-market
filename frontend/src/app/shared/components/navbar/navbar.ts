import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  @Input() cartCount = 0;
  @Input() search = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() menuToggle = new EventEmitter<void>();

  onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }
}