// Script para inicializar banco de dados em produção
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando banco de dados...')
    
    // Verificar conexão
    await prisma.$connect()
    console.log('✅ Conectado ao banco de dados')

    // Criar usuários
    const adminPassword = await bcrypt.hash('admin123', 10)
    const employeePassword = await bcrypt.hash('func123', 10)

    const admin = await prisma.user.upsert({
      where: { email: 'admin@pmcell.com.br' },
      update: {},
      create: {
        email: 'admin@pmcell.com.br',
        password: adminPassword,
        name: 'Administrador PMCELL',
        role: 'ADMIN',
        isActive: true
      }
    })
    console.log('✅ Admin criado:', admin.email)

    const employee = await prisma.user.upsert({
      where: { email: 'funcionario@pmcell.com.br' },
      update: {},
      create: {
        email: 'funcionario@pmcell.com.br',
        password: employeePassword,
        name: 'Funcionário Exemplo',
        role: 'EMPLOYEE',
        isActive: true
      }
    })
    console.log('✅ Funcionário criado:', employee.email)

    // Criar configurações da empresa
    const settings = await prisma.companySettings.upsert({
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
    console.log('✅ Configurações criadas')

    // Criar categorias
    const categories = [
      { name: 'Capas', slug: 'capas', order: 1 },
      { name: 'Películas', slug: 'peliculas', order: 2 },
      { name: 'Fones', slug: 'fones', order: 3 },
      { name: 'Carregadores', slug: 'carregadores', order: 4 },
      { name: 'Cabos', slug: 'cabos', order: 5 }
    ]

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { order: cat.order },
        create: cat
      })
    }
    console.log('✅ Categorias criadas')

    // Criar marcas
    const brands = ['Samsung', 'Apple', 'Motorola', 'Xiaomi']
    for (const brandName of brands) {
      await prisma.brand.upsert({
        where: { name: brandName },
        update: {},
        create: { name: brandName }
      })
    }
    console.log('✅ Marcas criadas')

    console.log('🎉 Banco de dados inicializado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

initializeDatabase()
  .then(() => {
    console.log('✅ Processo concluído')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Processo falhou:', error)
    process.exit(1)
  })