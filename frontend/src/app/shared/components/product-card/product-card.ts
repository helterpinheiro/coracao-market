import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import {
  ProductCategory,
  ProductView
} from '../../../features/products/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
  @Input({ required: true }) product!: ProductView;

  @Output() addToCart = new EventEmitter<ProductView>();

  readonly categoryLabels: Record<ProductCategory, string> = {
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