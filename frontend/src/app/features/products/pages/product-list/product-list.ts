import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';

import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs';

import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { ProductCard } from '../../../../shared/components/product-card/product-card';

import {
  Product,
  ProductCategory,
  ProductView
} from '../../models/product.model';

import { ProductService } from '../../services/product';
import { getProductImage } from '../../utils/product-image.util';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [Navbar, Sidebar, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);

  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  private requestId = 0;

  search = signal('');
  selectedCategory = signal('');
  sortOrder = signal('default');

  sidebarOpen = signal(false);
  cartCount = signal(0);

  loading = signal(false);
  error = signal<string | null>(null);

  page = signal(0);
  readonly pageSize = 12;

  totalElements = signal(0);
  totalPages = signal(0);

  products = signal<ProductView[]>([]);

  private readonly categoryLabels: Record<ProductCategory, string> = {
    FOOD: 'Mercearia',
    DAIRY: 'Laticínios',
    BEVERAGE: 'Bebidas',
    HYGIENE: 'Higiene pessoal',
    CLEANING: 'Limpeza',
    BAKERY: 'Padaria',
    PRODUCE: 'Hortifrúti',
    MEAT: 'Açougue'
  };

  categories = computed(() =>
    Object.keys(this.categoryLabels).sort((a, b) =>
      this.categoryLabels[a as ProductCategory].localeCompare(
        this.categoryLabels[b as ProductCategory],
        'pt-BR'
      )
    )
  );

  // O filtro de preço máximo será implementado no backend.
  // Por enquanto, exibimos os produtos retornados pela API.
  filteredProducts = computed(() => this.products());

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.page.set(0);
        this.loadProducts();
      });

    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.requestId++;

    this.destroy$.next();
    this.destroy$.complete();

    this.searchSubject.complete();
  }

  loadProducts(): void {
    const currentRequestId = ++this.requestId;

    this.loading.set(true);
    this.error.set(null);

    const sortMap: Record<string, string> = {
      'price-asc': 'price,asc',
      'price-desc': 'price,desc',
      name: 'name,asc'
    };

    this.productService.findAll({
      name: this.search(),
      category: (this.selectedCategory() || undefined) as
        ProductCategory | undefined,
      page: this.page(),
      size: this.pageSize,
      sort: sortMap[this.sortOrder()]
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          // Ignora respostas de requisições antigas.
          if (currentRequestId !== this.requestId) {
            return;
          }

          const products: ProductView[] = response.content.map(product => ({
            ...product,
            image: getProductImage(product)
          }));

          this.products.set(products);
          this.totalElements.set(response.totalElements);
          this.totalPages.set(response.totalPages);

          this.loading.set(false);
        },

        error: err => {
          if (currentRequestId !== this.requestId) {
            return;
          }

          console.error('Erro ao carregar produtos:', err);

          this.products.set([]);
          this.totalElements.set(0);
          this.totalPages.set(0);

          this.error.set('Não foi possível carregar os produtos.');
          this.loading.set(false);
        }
      });
  }

  updateSearch(value: string): void {
    this.search.set(value);

    // Invalida a busca anterior enquanto aguardamos o debounce.
    this.requestId++;

    this.searchSubject.next(value);
  }

  updateCategory(value: string): void {
    this.selectedCategory.set(value);
    this.page.set(0);

    this.loadProducts();
  }

  updateSortOrder(value: string): void {
    this.sortOrder.set(value);
    this.page.set(0);

    this.loadProducts();
  }

  clearFilters(): void {
    this.search.set('');
    this.selectedCategory.set('');
    this.sortOrder.set('default');
    this.page.set(0);

    this.loadProducts();
  }

  previousPage(): void {
    if (this.page() > 0 && !this.loading()) {
      this.page.update(page => page - 1);
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (
      this.page() + 1 < this.totalPages() &&
      !this.loading()
    ) {
      this.page.update(page => page + 1);
      this.loadProducts();
    }
  }

  addToCart(product: Product): void {
    if (product.stock <= 0) {
      return;
    }

    // Temporário: integração real com o carrinho será feita depois.
    this.cartCount.update(count => count + 1);
  }
}