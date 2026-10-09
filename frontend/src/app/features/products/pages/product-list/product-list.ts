import { Component, computed, signal } from '@angular/core';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [Navbar, Sidebar, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList {
  search = signal('');
  selectedCategory = signal('');
  maxPrice = signal<number | null>(null);
  sortOrder = signal('default');
  sidebarOpen = signal(false);
  cartCount = signal(0);

  products = signal<Product[]>([
    {
      id: 1,
      name: 'Banana prata 1kg',
      category: 'Hortifrúti',
      price: 6.99,
      stock: 30,
      image: 'assets/products/banana.png'
    },
    {
      id: 2,
      name: 'Maçã vermelha 1kg',
      category: 'Hortifrúti',
      price: 9.90,
      stock: 25,
      image: 'assets/products/maca.png'
    },
    {
      id: 3,
      name: 'Arroz branco 1kg',
      category: 'Mercearia',
      price: 7.49,
      stock: 50,
      image: 'assets/products/arroz.png'
    },
    {
      id: 4,
      name: 'Leite integral 1L',
      category: 'Laticínios',
      price: 5.99,
      stock: 40,
      image: 'assets/products/leite.png'
    },
    {
      id: 5,
      name: 'Pão francês 1kg',
      category: 'Padaria',
      price: 14.90,
      stock: 20,
      image: 'assets/products/pao.png'
    },
    {
      id: 6,
      name: 'Tomate 1kg',
      category: 'Hortifrúti',
      price: 8.49,
      stock: 35,
      image: 'assets/products/tomate.png'
    }
  ]);

  categories = computed(() =>
    [...new Set(this.products().map(product => product.category))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
  );

  filteredProducts = computed(() => {
    const search = this.search().trim().toLocaleLowerCase('pt-BR');
    const category = this.selectedCategory();
    const maxPrice = this.maxPrice();
    const sortOrder = this.sortOrder();

    const result = this.products().filter(product => {
      const matchesSearch =
        product.name.toLocaleLowerCase('pt-BR').includes(search);

      const matchesCategory =
        !category || product.category === category;

      const matchesPrice =
        maxPrice === null || product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    switch (sortOrder) {
      case 'price-asc':
        return result.sort((a, b) => a.price - b.price);

      case 'price-desc':
        return result.sort((a, b) => b.price - a.price);

      case 'name':
        return result.sort((a, b) =>
          a.name.localeCompare(b.name, 'pt-BR')
        );

      default:
        return result;
    }
  });

  addToCart(product: Product): void {
    if (product.stock <= 0) {
      return;
    }

    this.cartCount.update(count => count + 1);
  }
}