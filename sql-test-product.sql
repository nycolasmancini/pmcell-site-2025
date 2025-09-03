-- SQL para criar produto de teste diretamente no banco
-- Execute no PostgreSQL se admin não funcionar

-- Primeiro, verificar se há categorias
SELECT id, name FROM "Category" WHERE "isActive" = true LIMIT 5;

-- Inserir produto de teste (substitua 'CATEGORY_ID_AQUI' por um ID real da query acima)
INSERT INTO "Product" (
  id,
  name,
  subname,
  description,
  brand,
  price,
  "superWholesalePrice",
  "superWholesaleQuantity",
  cost,
  "categoryId",
  "isActive",
  featured,
  "isModalProduct",
  "createdAt",
  "updatedAt"
) VALUES (
  'test-produto-' || extract(epoch from now()),
  'Cabo USB-C Premium TESTE',
  'Carregamento ultra rápido',
  'Cabo USB-C premium com tecnologia de carregamento rápido e certificação de qualidade',
  'TechMax Pro',
  15.90,
  12.50,
  50,
  8.00,
  'CATEGORY_ID_AQUI', -- SUBSTITUA por um ID real da primeira query
  true,
  true,
  false,
  NOW(),
  NOW()
);

-- Verificar se foi criado
SELECT 
  id, name, subname, brand, price, 
  "superWholesalePrice", "superWholesaleQuantity", cost
FROM "Product" 
WHERE name LIKE '%TESTE%' 
ORDER BY "createdAt" DESC 
LIMIT 3;