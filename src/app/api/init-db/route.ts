import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Verificar se já foi inicializado
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN }
    }).catch(() => null)

    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'Banco já inicializado',
        admin: existingAdmin.email 
      })
    }

    console.log('🚀 Inicializando banco de dados...')

    // Criar usuários
    const adminPassword = await bcrypt.hash('admin123', 10)
    const employeePassword = await bcrypt.hash('func123', 10)

    const admin = await prisma.user.create({
      data: {
        email: 'admin@pmcell.com.br',
        password: adminPassword,
        name: 'Administrador PMCELL',
        role: UserRole.ADMIN,
        isActive: true
      }
    })

    const employee = await prisma.user.create({
      data: {
        email: 'funcionario@pmcell.com.br',
        password: employeePassword,
        name: 'Funcionário Exemplo',
        role: UserRole.EMPLOYEE,
        isActive: true
      }
    })

    // Criar configurações da empresa
    const settings = await prisma.companySettings.create({
      data: {
        companyName: 'PMCELL São Paulo',
        tradeName: 'PMCELL SP',
        primaryColor: '#FC6D36',
        whatsapp: '5511999999999',
        email: 'contato@pmcell.com.br',
        minOrderValue: 100
      }
    })

    // Criar categorias
    const categories = [
      { name: 'Capas', slug: 'capas', order: 1 },
      { name: 'Películas', slug: 'peliculas', order: 2 },
      { name: 'Fones', slug: 'fones', order: 3 },
      { name: 'Carregadores', slug: 'carregadores', order: 4 },
      { name: 'Cabos', slug: 'cabos', order: 5 }
    ]

    const createdCategories = []
    for (const cat of categories) {
      const category = await prisma.category.create({ data: cat })
      createdCategories.push(category)
    }

    // Criar marcas
    const brands = ['Samsung', 'Apple', 'Motorola', 'Xiaomi']
    const createdBrands = []
    for (const brandName of brands) {
      const brand = await prisma.brand.create({
        data: { name: brandName }
      })
      createdBrands.push(brand)
    }

    // Criar transportadoras
    const transportadoras = [
      { name: 'Correios', order: 1 },
      { name: 'Jadlog', order: 2 },
      { name: 'Loggi', order: 3 }
    ]

    for (const transportadora of transportadoras) {
      await prisma.shippingCompany.create({
        data: {
          name: transportadora.name,
          order: transportadora.order,
          isActive: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Banco de dados inicializado com sucesso!',
      data: {
        admin: admin.email,
        employee: employee.email,
        categories: createdCategories.length,
        brands: createdBrands.length,
        settings: settings.companyName
      }
    })

  } catch (error) {
    console.error('Erro ao inicializar banco:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao inicializar banco de dados',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}