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
  @Input() maxPrice: number | null = null;
  @Input() sortOrder = 'default';

  @Output() categoryChange = new EventEmitter<string>();
  @Output() maxPriceChange = new EventEmitter<number | null>();
  @Output() sortOrderChange = new EventEmitter<string>();
  @Output() closeSidebar = new EventEmitter<void>();

  updateMaxPrice(value: number | null): void {
    this.maxPriceChange.emit(
      value === null || value < 0 ? null : value
    );
  }

  clearFilters(): void {
    this.categoryChange.emit('');
    this.maxPriceChange.emit(null);
    this.sortOrderChange.emit('default');
  }
}