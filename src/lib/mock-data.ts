// Dados mock para quando o banco não estiver disponível

export const mockCategories = [
  {
    id: "1",
    name: "Capas e Cases",
    slug: "capas-cases",
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { products: 25 }
  },
  {
    id: "2", 
    name: "Películas Protetoras",
    slug: "peliculas",
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { products: 18 }
  },
  {
    id: "3",
    name: "Fones de Ouvido",
    slug: "fones",
    order: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { products: 15 }
  },
  {
    id: "4",
    name: "Carregadores",
    slug: "carregadores",
    order: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { products: 20 }
  },
  {
    id: "5",
    name: "Cabos USB",
    slug: "cabos-usb",
    order: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { products: 12 }
  },
  {
    id: "6",
    name: "Suportes Veiculares",
    slug: "suportes",
    order: 6,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { products: 8 }
  }
];

export const mockProducts = [
  // Capas
  {
    id: "1",
    name: "Capa TPU Transparente",
    subname: "Anti-impacto",
    description: "Capa de silicone transparente com proteção anti-impacto",
    brand: "GenericBrand",
    categoryId: "1",
    isModalProduct: true,
    quickAddIncrement: 25,
    price: 8.50,
    superWholesalePrice: 7.20,
    superWholesaleQuantity: 100,
    cost: 4.50,
    boxQuantity: 50,
    isActive: true,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: mockCategories[0],
    images: [
      {
        id: "1",
        productId: "1",
        url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7+ooooAKKKKACiiigAooooAKKKKACiiigD//Z",
        fileName: "capa-transparente.jpg",
        order: 0,
        isMain: true,
        createdAt: new Date()
      }
    ],
    suppliers: [],
    models: [
      {
        id: "1",
        productId: "1",
        modelId: "1",
        price: 8.50,
        superWholesalePrice: 7.20,
        createdAt: new Date(),
        model: {
          id: "1",
          name: "iPhone 15",
          brandId: "1",
          brand: { id: "1", name: "Apple", order: 1, createdAt: new Date() },
          createdAt: new Date()
        }
      }
    ],
    hasModels: true,
    priceRange: { min: 8.50, max: 8.50, superWholesaleMin: 7.20, superWholesaleMax: 7.20 }
  },
  // Películas
  {
    id: "2",
    name: "Película de Vidro 5D",
    subname: "Borda Curvada",
    description: "Película de vidro temperado com bordas curvadas 5D",
    brand: "Premium Glass",
    categoryId: "2",
    isModalProduct: true,
    quickAddIncrement: 25,
    price: 12.90,
    superWholesalePrice: 10.50,
    superWholesaleQuantity: 50,
    cost: 6.00,
    boxQuantity: 25,
    isActive: true,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: mockCategories[1],
    images: [
      {
        id: "2",
        productId: "2",
        url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7+ooooAKKKKACiiigAooooAKKKKACiiigD//Z",
        fileName: "pelicula-vidro.jpg",
        order: 0,
        isMain: true,
        createdAt: new Date()
      }
    ],
    suppliers: [],
    models: [
      {
        id: "2",
        productId: "2",
        modelId: "1",
        price: 12.90,
        superWholesalePrice: 10.50,
        createdAt: new Date(),
        model: {
          id: "1",
          name: "iPhone 15",
          brandId: "1",
          brand: { id: "1", name: "Apple", order: 1, createdAt: new Date() },
          createdAt: new Date()
        }
      }
    ],
    hasModels: true,
    priceRange: { min: 12.90, max: 12.90, superWholesaleMin: 10.50, superWholesaleMax: 10.50 }
  },
  // Fone Bluetooth
  {
    id: "3",
    name: "Fone Bluetooth TWS",
    subname: "Cancelamento de Ruído",
    description: "Fone de ouvido Bluetooth True Wireless com cancelamento de ruído ativo",
    brand: "SoundMax",
    categoryId: "3",
    isModalProduct: false,
    quickAddIncrement: 10,
    price: 45.90,
    superWholesalePrice: 38.50,
    superWholesaleQuantity: 50,
    cost: 25.00,
    boxQuantity: 20,
    isActive: true,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: mockCategories[2],
    images: [
      {
        id: "3",
        productId: "3",
        url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAxQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7+ooooAKKKKACiiigAooooAKKKKACiiigD//Z",
        fileName: "fone-bluetooth.jpg",
        order: 0,
        isMain: true,
        createdAt: new Date()
      }
    ],
    suppliers: [],
    models: [],
    hasModels: false
  },
  // Carregador Rápido
  {
    id: "4",
    name: "Carregador Rápido 65W",
    subname: "USB-C PD + QC 3.0",
    description: "Carregador rápido com porta USB-C Power Delivery e Quick Charge 3.0",
    brand: "PowerMax",
    categoryId: "4",
    isModalProduct: false,
    quickAddIncrement: 10,
    price: 32.90,
    superWholesalePrice: 28.50,
    superWholesaleQuantity: 30,
    cost: 18.00,
    boxQuantity: 25,
    isActive: true,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: mockCategories[3],
    images: [
      {
        id: "4",
        productId: "4",
        url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7+ooooAKKKKACiiigAooooAKKKKACiiigD//Z",
        fileName: "carregador-rapido.jpg",
        order: 0,
        isMain: true,
        createdAt: new Date()
      }
    ],
    suppliers: [],
    models: [],
    hasModels: false
  }
];

// Função para filtrar produtos por categoria
export function getProductsByCategory(categoryId: string | null) {
  if (!categoryId) return mockProducts;
  return mockProducts.filter(product => product.categoryId === categoryId);
}

// Função para buscar produtos por termo
export function searchProducts(searchTerm: string) {
  if (!searchTerm) return mockProducts;
  
  const term = searchTerm.toLowerCase();
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(term) ||
    product.description.toLowerCase().includes(term) ||
    product.brand?.toLowerCase().includes(term)
  );
}

// Função para verificar se está usando dados mock
export function isUsingMockData() {
  return true; // Por enquanto sempre true, pode ser usado para detectar se o banco está online
}