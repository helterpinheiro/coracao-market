import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  @Input() categories: string[] = [];
  @Input() selectedCategory = '';
  @Input() sortOrder = 'default';

  @Output() categoryChange = new EventEmitter<string>();
  @Output() sortOrderChange = new EventEmitter<string>();
  @Output() closeSidebar = new EventEmitter<void>();


  clearFilters(): void {
    this.categoryChange.emit('');
    this.sortOrderChange.emit('default');
  }

  readonly categoryLabels: Record<string, string> = {
    FOOD: 'Mercearia',
    DAIRY: 'Laticínios',
    BEVERAGE: 'Bebidas',
    HYGIENE: 'Higiene pessoal',
    CLEANING: 'Limpeza',
    BAKERY: 'Padaria',
    PRODUCE: 'Hortifrúti',
    MEAT: 'Açougue'
  };
}