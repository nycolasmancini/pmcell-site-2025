import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { testConnection, createProduct } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { name, description, brand, categoryId, quickAddIncrement } = body
    
    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Nome e categoria são obrigatórios' }, { status: 400 })
    }

    // Criar produto modal básico
    let product
    
    // Em produção, usar SQL direto para evitar problemas com Prisma Accelerate
    if (process.env.NODE_ENV === 'production') {
      console.log('📊 Using production SQL direct insert for modal product')
      
      // Testar conexão primeiro
      const isConnected = await testConnection()
      if (!isConnected) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
      }
      
      // Criar produto via SQL direto
      product = await createProduct({
        name,
        description: description || '',
        brand: brand || null,
        categoryId,
        isModalProduct: true,
        quickAddIncrement: quickAddIncrement ? parseInt(quickAddIncrement) : null,
        price: 0 // Produto modal não tem preço próprio
      })
      
    } else {
      console.log('📊 Using development Prisma create for modal product')
      
      // Em desenvolvimento, usar Prisma normalmente
      product = await prisma.product.create({
        data: {
          name,
          description: description || '',
          brand: brand || null,
          categoryId,
          isModalProduct: true,
          quickAddIncrement: quickAddIncrement ? parseInt(quickAddIncrement) : null,
          price: 0 // Produto modal não tem preço próprio
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        isModalProduct: product.isModalProduct,
        quickAddIncrement: product.quickAddIncrement
      }
    })

  } catch (error) {
    console.error('Erro ao criar produto modal:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}