INSERT INTO products (
    id,
    name,
    description,
    category,
    price,
    stock,
    active,
    created_at,
    updated_at
) VALUES

(gen_random_uuid(), 'Arroz Tipo 1 5kg',
 'Arroz branco tipo 1, pacote de 5kg',
 'FOOD', 24.90, 50, true, NOW(), NOW()),

(gen_random_uuid(), 'Feijão Carioca 1kg',
 'Feijão carioca selecionado, pacote de 1kg',
 'FOOD', 8.99, 40, true, NOW(), NOW()),

(gen_random_uuid(), 'Macarrão Espaguete 500g',
 'Macarrão de sêmola tipo espaguete',
 'FOOD', 4.79, 35, true, NOW(), NOW()),

(gen_random_uuid(), 'Café Torrado 500g',
 'Café torrado e moído tradicional',
 'FOOD', 18.90, 25, true, NOW(), NOW()),

(gen_random_uuid(), 'Leite Integral 1L',
 'Leite integral UHT',
 'DAIRY', 5.49, 60, true, NOW(), NOW()),

(gen_random_uuid(), 'Leite Desnatado 1L',
 'Leite desnatado UHT',
 'DAIRY', 5.69, 45, true, NOW(), NOW()),

(gen_random_uuid(), 'Queijo Mussarela 500g',
 'Queijo mussarela fatiado',
 'DAIRY', 22.90, 20, true, NOW(), NOW()),

(gen_random_uuid(), 'Refrigerante Cola 2L',
 'Refrigerante sabor cola',
 'BEVERAGE', 9.99, 70, true, NOW(), NOW()),

(gen_random_uuid(), 'Suco de Laranja 1L',
 'Suco de laranja pronto para consumo',
 'BEVERAGE', 8.49, 30, true, NOW(), NOW()),

(gen_random_uuid(), 'Água Mineral 1.5L',
 'Água mineral sem gás',
 'BEVERAGE', 3.29, 100, true, NOW(), NOW()),

(gen_random_uuid(), 'Sabonete 90g',
 'Sabonete para higiene pessoal',
 'HYGIENE', 3.49, 80, true, NOW(), NOW()),

(gen_random_uuid(), 'Papel Higiênico 12 Rolos',
 'Papel higiênico folha dupla',
 'HYGIENE', 17.90, 45, true, NOW(), NOW()),

(gen_random_uuid(), 'Detergente 500ml',
 'Detergente líquido neutro',
 'CLEANING', 2.99, 90, true, NOW(), NOW()),

(gen_random_uuid(), 'Água Sanitária 1L',
 'Água sanitária para limpeza',
 'CLEANING', 4.49, 50, true, NOW(), NOW()),

(gen_random_uuid(), 'Pão Francês',
 'Pão francês vendido por unidade',
 'BAKERY', 0.90, 120, true, NOW(), NOW()),

(gen_random_uuid(), 'Bolo de Chocolate',
 'Bolo de chocolate produzido na padaria',
 'BAKERY', 18.90, 12, true, NOW(), NOW()),

(gen_random_uuid(), 'Banana Prata 1kg',
 'Banana prata fresca',
 'PRODUCE', 6.99, 35, true, NOW(), NOW()),

(gen_random_uuid(), 'Tomate 1kg',
 'Tomate fresco selecionado',
 'PRODUCE', 7.49, 30, true, NOW(), NOW()),

(gen_random_uuid(), 'Peito de Frango 1kg',
 'Peito de frango resfriado',
 'MEAT', 19.90, 25, true, NOW(), NOW()),

(gen_random_uuid(), 'Carne Bovina 1kg',
 'Corte bovino resfriado',
 'MEAT', 39.90, 15, true, NOW(), NOW());