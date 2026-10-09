import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Product,
  ProductCategory,
  PageResponse
} from '../models/product.model';

export interface ProductFilters {
  name?: string;
  category?: ProductCategory;
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/products';

  findAll(filters: ProductFilters = {}): Observable<PageResponse<Product>> {
    let params = new HttpParams()
      .set('page', filters.page ?? 0)
      .set('size', filters.size ?? 12);

    if (filters.name?.trim()) {
      params = params.set('name', filters.name.trim());
    }

    if (filters.category) {
      params = params.set('category', filters.category);
    }

    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }

    return this.http.get<PageResponse<Product>>(this.apiUrl, { params });
  }
}