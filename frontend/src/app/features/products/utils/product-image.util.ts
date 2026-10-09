import { Product } from '../models/product.model';

const PRODUCT_IMAGES: Record<string, string> = {
  'Arroz Tipo 1 5kg': 'arroz-tipo-1-5kg.webp',
  'Feijão Carioca 1kg': 'feijao-carioca-1kg.webp',
  'Macarrão Espaguete 500g': 'macarrao-espaguete-500g.webp',
  'Café Torrado 500g': 'cafe-torrado-500g.webp',

  'Leite Integral 1L': 'leite-integral-1l.webp',
  'Leite Desnatado 1L': 'leite-desnatado-1l.webp',
  'Queijo Mussarela 500g': 'queijo-mussarela-500g.webp',

  'Refrigerante Cola 2L': 'refrigerante-cola-2l.webp',
  'Suco de Laranja 1L': 'suco-laranja-1l.webp',
  'Água Mineral 1.5L': 'agua-mineral-1-5l.webp',

  'Sabonete 90g': 'sabonete-90g.webp',
  'Papel Higiênico 12 Rolos': 'papel-higienico-12-rolos.webp',

  'Detergente 500ml': 'detergente-500ml.webp',
  'Água Sanitária 1L': 'agua-sanitaria-1l.webp',

  'Pão Francês': 'pao-frances.webp',
  'Bolo de Chocolate': 'bolo-chocolate.webp',

  'Banana Prata 1kg': 'banana-prata-1kg.webp',
  'Tomate 1kg': 'tomate-1kg.webp',

  'Peito de Frango 1kg': 'peito-frango-1kg.webp',
  'Carne Bovina 1kg': 'carne-bovina-1kg.webp'
};

export function getProductImage(product: Product): string {
  const filename = PRODUCT_IMAGES[product.name];

  return filename
    ? `/assets/products/${filename}`
    : '/assets/products/placeholder.webp';
}