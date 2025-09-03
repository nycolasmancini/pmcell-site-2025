export const siteConfig = {
  name: "PMCELL São Paulo",
  description: "Acessórios para celular no atacado",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  // Cores
  colors: {
    primary: "#FC6D36",
    secondary: "#1a1a1a",
    background: "#ffffff",
    foreground: "#0a0a0a",
  },
  
  // Categorias padrão
  defaultCategories: [
    { name: "Capas", slug: "capas", order: 1 },
    { name: "Películas", slug: "peliculas", order: 2 },
    { name: "Fones", slug: "fones", order: 3 },
    { name: "Fones Bluetooth", slug: "fones-bluetooth", order: 4 },
    { name: "Caixas de Som", slug: "caixas-de-som", order: 5 },
    { name: "Cabos", slug: "cabos", order: 6 },
    { name: "Carregadores", slug: "carregadores", order: 7 },
    { name: "Suportes", slug: "suportes", order: 8 },
    { name: "Carregadores Veicular", slug: "carregadores-veicular", order: 9 },
    { name: "Smartwatch", slug: "smartwatch", order: 10 },
  ],
  
  // Kits padrão
  defaultKits: [
    {
      name: "Kit Marketplace",
      description: "Ideal para quem vende online. Produtos com alta demanda em marketplaces.",
      discount: 50,
      order: 1,
    },
    {
      name: "Kit Giro Rápido",
      description: "Produtos que vendem todo dia. Perfeito para manter o caixa girando.",
      discount: 75,
      order: 2,
    },
    {
      name: "Kit Loja Completa",
      description: "Tudo que você precisa para montar ou renovar sua loja de acessórios.",
      discount: 150,
      order: 3,
    },
  ],
  
  // Configurações de negócio
  business: {
    minOrderValue: 100, // Valor mínimo do pedido em R$
    abandonedCartTimeout: 20 * 60 * 1000, // 20 minutos em ms
    sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
  },
  
  // Webhooks
  webhooks: {
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT || "60000"),
    endpoints: {
      priceUnlock: "/api/webhooks/price-unlock",
      orderCreated: "/api/webhooks/order-created",
      orderUpdated: "/api/webhooks/order-updated",
      cartAbandoned: "/api/webhooks/cart-abandoned",
      productSearch: "/api/webhooks/product-search",
      productView: "/api/webhooks/product-view",
      categoryView: "/api/webhooks/category-view",
    },
  },
  
  // Mensagens padrão
  messages: {
    priceUnlock: {
      title: "🎉 Preços Exclusivos para Lojistas!",
      subtitle: "Veja os melhores preços do atacado",
      benefits: [
        "✓ Preços especiais no atacado",
        "✓ Descontos progressivos por quantidade",
        "✓ Atendimento personalizado via WhatsApp",
        "✓ Entrega rápida para todo Brasil",
      ],
      cta: "Liberar Preços Agora",
      privacy: "Seus dados estão seguros e não serão compartilhados.",
    },
    cart: {
      empty: "Seu carrinho está vazio",
      addItems: "Adicione produtos para começar",
      upgradeQuantity: {
        title: "💡 Que tal aproveitar um desconto?",
        message: "Adicione mais {quantity} unidades e ganhe {discount} de desconto!",
        cta: "Adicionar e Economizar",
        skip: "Continuar sem desconto",
      },
    },
    order: {
      success: "✅ Pedido realizado com sucesso!",
      pending: "Aguarde, estamos processando seu pedido...",
      error: "Ops! Algo deu errado. Tente novamente.",
    },
  },
}