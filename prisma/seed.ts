import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')
  
  // Criar usuários no novo sistema
  const adminPassword = await bcrypt.hash('admin123', 10)
  const employeePassword = await bcrypt.hash('func123', 10)
  
  // Verificar se já existe um admin no novo sistema
  const existingUser = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN }
  }).catch(() => null) // Ignore se a tabela não existir ainda

  if (!existingUser) {
    try {
      const admin = await prisma.user.upsert({
        where: { email: 'admin@pmcell.com.br' },
        update: {},
        create: {
          email: 'admin@pmcell.com.br',
          password: adminPassword,
          name: 'Administrador PMCELL',
          role: UserRole.ADMIN,
          isActive: true
        }
      })

      console.log('✅ Admin criado no novo sistema:', admin.email)

      const employee = await prisma.user.upsert({
        where: { email: 'funcionario@pmcell.com.br' },
        update: {},
        create: {
          email: 'funcionario@pmcell.com.br',
          password: employeePassword,
          name: 'Funcionário Exemplo',
          role: UserRole.EMPLOYEE,
          isActive: true
        }
      })

      console.log('✅ Funcionário criado no novo sistema:', employee.email)
    } catch (error) {
      console.log('⚠️ Tabela User ainda não existe, pulando criação de usuários...')
    }
  }

  // Manter admin legado para compatibilidade
  const adminLegacy = await prisma.admin.upsert({
    where: { email: 'admin@pmcell.com.br' },
    update: {},
    create: {
      email: 'admin@pmcell.com.br',
      password: adminPassword,
      name: 'Administrador'
    }
  }).catch(() => {
    console.log('⚠️ Tabela Admin não encontrada, pulando...')
    return null
  })

  if (adminLegacy) {
    console.log('✅ Admin legado mantido:', adminLegacy.email)
  }

  // Criar transportadoras padrão
  const transportadoras = [
    { name: 'Correios', order: 1 },
    { name: 'Jadlog', order: 2 },
    { name: 'Loggi', order: 3 },
    { name: 'J&T Express', order: 4 },
    { name: 'Braspress', order: 5 },
    { name: 'Rodonaves', order: 6 }
  ]

  for (const transportadora of transportadoras) {
    await prisma.shippingCompany.upsert({
      where: { name: transportadora.name },
      update: {},
      create: {
        name: transportadora.name,
        order: transportadora.order,
        isActive: true
      }
    })
  }

  console.log('Transportadoras criadas')

  // Criar categorias
  const categories = [
    { name: 'Capas', slug: 'capas', order: 1 },
    { name: 'Películas', slug: 'peliculas', order: 2 },
    { name: 'Fones', slug: 'fones', order: 3 },
    { name: 'Fones Bluetooth', slug: 'fones-bluetooth', order: 4 },
    { name: 'Caixas de Som', slug: 'caixas-de-som', order: 5 },
    { name: 'Cabos', slug: 'cabos', order: 6 },
    { name: 'Carregadores', slug: 'carregadores', order: 7 },
    { name: 'Suportes', slug: 'suportes', order: 8 },
    { name: 'Carregadores Veicular', slug: 'carregadores-veicular', order: 9 },
    { name: 'Smartwatch', slug: 'smartwatch', order: 10 }
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { order: cat.order },
      create: cat
    })
  }

  console.log('Categorias criadas')

  // Criar marcas para capas e películas
  const brands = [
    'Samsung', 'Apple', 'Motorola', 'Xiaomi', 'LG', 'Asus', 'Realme'
  ]

  for (const brandName of brands) {
    await prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName }
    })
  }

  console.log('Marcas criadas')

  // Criar alguns modelos de exemplo
  const samsungBrand = await prisma.brand.findUnique({ where: { name: 'Samsung' } })
  const appleBrand = await prisma.brand.findUnique({ where: { name: 'Apple' } })

  if (samsungBrand) {
    const samsungModels = [
      'Galaxy S23', 'Galaxy S23 Plus', 'Galaxy S23 Ultra',
      'Galaxy A54', 'Galaxy A34', 'Galaxy A14'
    ]

    for (const modelName of samsungModels) {
      await prisma.model.upsert({
        where: { 
          brandId_name: {
            brandId: samsungBrand.id,
            name: modelName
          }
        },
        update: {},
        create: {
          name: modelName,
          brandId: samsungBrand.id
        }
      })
    }
  }

  if (appleBrand) {
    const appleModels = [
      'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
      'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
      'iPhone 13', 'iPhone 13 Mini'
    ]

    for (const modelName of appleModels) {
      await prisma.model.upsert({
        where: { 
          brandId_name: {
            brandId: appleBrand.id,
            name: modelName
          }
        },
        update: {},
        create: {
          name: modelName,
          brandId: appleBrand.id
        }
      })
    }
  }

  console.log('Modelos criados')

  // Criar configurações da empresa
  await prisma.companySettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'PMCELL São Paulo',
      tradeName: 'PMCELL SP',
      primaryColor: '#FC6D36',
      whatsapp: '5511999999999',
      email: 'contato@pmcell.com.br',
      minOrderValue: 100
    }
  })

  console.log('Configurações da empresa criadas')

  // Criar alguns produtos de exemplo
  const capasCategory = await prisma.category.findUnique({ where: { slug: 'capas' } })
  const fonesCategory = await prisma.category.findUnique({ where: { slug: 'fones' } })
  const carregadoresCategory = await prisma.category.findUnique({ where: { slug: 'carregadores' } })

  if (capasCategory) {
    await prisma.product.create({
      data: {
        name: 'Capa Silicone Premium',
        subname: 'Proteção total com toque suave',
        description: 'Capa de silicone premium com proteção nas bordas',
        categoryId: capasCategory.id,
        price: 15.90,
        specialPrice: 12.90,
        specialQuantity: 10,
        cost: 8.00,
        featured: true
      }
    })

    await prisma.product.create({
      data: {
        name: 'Capa Anti-Impacto',
        subname: 'Proteção militar',
        description: 'Capa com tecnologia anti-impacto e proteção nas quinas',
        categoryId: capasCategory.id,
        price: 25.90,
        specialPrice: 19.90,
        specialQuantity: 10,
        cost: 12.00
      }
    })
  }

  if (fonesCategory) {
    await prisma.product.create({
      data: {
        name: 'Fone de Ouvido P2',
        subname: 'Som de qualidade',
        description: 'Fone de ouvido com cabo P2, compatível com todos os dispositivos',
        categoryId: fonesCategory.id,
        price: 12.90,
        specialPrice: 9.90,
        specialQuantity: 20,
        cost: 5.00,
        boxQuantity: 12,
        featured: true
      }
    })
  }

  if (carregadoresCategory) {
    await prisma.product.create({
      data: {
        name: 'Carregador Turbo 20W',
        subname: 'Carregamento rápido',
        description: 'Carregador turbo com tecnologia de carregamento rápido',
        categoryId: carregadoresCategory.id,
        price: 35.90,
        specialPrice: 28.90,
        specialQuantity: 10,
        cost: 18.00,
        featured: true
      }
    })

    await prisma.product.create({
      data: {
        name: 'Cabo USB-C 2 metros',
        subname: 'Reforçado',
        description: 'Cabo USB-C reforçado de 2 metros',
        categoryId: carregadoresCategory.id,
        price: 18.90,
        specialPrice: 14.90,
        specialQuantity: 20,
        cost: 8.00,
        boxQuantity: 10
      }
    })
  }

  console.log('Produtos de exemplo criados')

  // Criar kits
  const products = await prisma.product.findMany({ take: 3 })
  
  if (products.length >= 3) {
    const kitMarketplace = await prisma.kit.create({
      data: {
        name: 'Kit Marketplace',
        description: 'Kit inicial perfeito para vendas online',
        discount: 50,
        order: 1,
        products: {
          create: [
            { productId: products[0].id, quantity: 10 },
            { productId: products[1].id, quantity: 5 },
            { productId: products[2].id, quantity: 5 }
          ]
        }
      }
    })

    const kitGiroRapido = await prisma.kit.create({
      data: {
        name: 'Kit Giro Rápido',
        description: 'Produtos de alta rotatividade',
        discount: 100,
        order: 2,
        products: {
          create: [
            { productId: products[0].id, quantity: 20 },
            { productId: products[1].id, quantity: 15 },
            { productId: products[2].id, quantity: 10 }
          ]
        }
      }
    })

    console.log('Kits criados')
  }

  // Criar produtos com super atacado para teste
  console.log('🛒 Criando produtos com super atacado...')
  
  const cabosCategory = await prisma.category.findUnique({ where: { slug: 'cabos' } })
  
  if (cabosCategory) {
    const existingCaboUSBC = await prisma.product.findFirst({
      where: { name: 'Cabo USB-C Premium', categoryId: cabosCategory.id }
    })
    
    if (!existingCaboUSBC) {
      await prisma.product.create({
        data: {
          name: 'Cabo USB-C Premium',
          subname: 'Carregamento rápido',
          description: 'Cabo USB-C com tecnologia de carregamento rápido',
          categoryId: cabosCategory.id,
          price: 15.90,
          superWholesalePrice: 12.50,
          superWholesaleQuantity: 50,
          cost: 8.00,
          featured: true
        }
      })
    }

    const existingCaboLightning = await prisma.product.findFirst({
      where: { name: 'Cabo Lightning Certificado', categoryId: cabosCategory.id }
    })
    
    if (!existingCaboLightning) {
      await prisma.product.create({
        data: {
          name: 'Cabo Lightning Certificado',
          subname: 'MFi Apple',
          description: 'Cabo Lightning certificado pela Apple',
          categoryId: cabosCategory.id,
          price: 24.90,
          superWholesalePrice: 19.90,
          superWholesaleQuantity: 30,
          cost: 12.00
        }
      })
    }
  }

  if (capasCategory) {
    const existingCapaTPU = await prisma.product.findFirst({
      where: { name: 'Capa TPU Transparente', categoryId: capasCategory.id }
    })
    
    if (!existingCapaTPU) {
      await prisma.product.create({
        data: {
          name: 'Capa TPU Transparente',
          subname: 'Anti-impacto',
          description: 'Capa de silicone transparente com proteção anti-impacto',
          categoryId: capasCategory.id,
          price: 8.50,
          superWholesalePrice: 6.90,
          superWholesaleQuantity: 100,
          cost: 4.50,
          featured: true
        }
      })
    }
  }

  console.log('✅ Produtos com super atacado criados')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })