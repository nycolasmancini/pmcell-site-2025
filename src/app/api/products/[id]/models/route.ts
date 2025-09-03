import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { query as dbQuery, testConnection, findOrCreateBrand, findOrCreateModel, createProductModel } from '@/lib/db'
import { invalidateProductCache } from '@/lib/cache'
import { revalidatePath } from 'next/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    let models: any[] = []

    // Em produção, usar SQL direto para evitar problemas com Prisma Accelerate
    if (process.env.NODE_ENV === 'production') {
      console.log('📊 Using production SQL direct query for product models')
      
      // Testar conexão primeiro
      const isConnected = await testConnection()
      if (!isConnected) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
      }

      // Query SQL para buscar modelos com suas marcas
      const sqlQuery = `
        SELECT 
          pm.id,
          pm."price",
          pm."superWholesalePrice",
          m.id as model_id,
          m.name as model_name,
          b.name as brand_name
        FROM "ProductModel" pm
        JOIN "Model" m ON pm."modelId" = m.id
        JOIN "Brand" b ON m."brandId" = b.id
        WHERE pm."productId" = $1
        ORDER BY b.name, m.name
      `
      
      const result = await dbQuery(sqlQuery, [productId])
      
      // Transformar dados para o formato esperado pelo frontend
      if (result && result.rows) {
        models = result.rows.map((row: any) => ({
          id: row.id, // ProductModel ID para permitir edição/remoção
          brandName: row.brand_name,
          modelName: row.model_name,
          price: parseFloat(row.price) || 0,
          superWholesalePrice: row.superWholesalePrice ? parseFloat(row.superWholesalePrice) : null
        }))
      } else {
        models = []
      }
      
    } else {
      console.log('📊 Using development Prisma query for product models')
      
      // Em desenvolvimento, usar Prisma normalmente
      const productModels = await prisma.productModel.findMany({
        where: {
          productId
        },
        include: {
          model: {
            include: {
              brand: true
            }
          }
        },
        orderBy: [
          { model: { brand: { name: 'asc' } } },
          { model: { name: 'asc' } }
        ]
      })

      // Transformar dados para o formato esperado pelo frontend
      models = productModels.map((pm: any) => ({
        id: pm.id, // ProductModel ID para permitir edição/remoção
        brandName: pm.model.brand.name,
        modelName: pm.model.name,
        price: pm.price || 0,
        superWholesalePrice: pm.superWholesalePrice
      }))
    }

    return NextResponse.json(models)

  } catch (error) {
    console.error('Erro ao buscar modelos do produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const body = await request.json()
    const { brandName, modelName, price, superWholesalePrice } = body

    // Validar dados obrigatórios
    if (!brandName || !modelName || !price) {
      return NextResponse.json(
        { error: 'Marca, modelo e preço são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o produto existe e é um produto modal
    let product: any = null
    if (process.env.NODE_ENV === 'production') {
      const productResult = await dbQuery('SELECT * FROM "Product" WHERE "id" = $1', [productId])
      product = productResult?.rows?.[0]
    } else {
      product = await prisma.product.findUnique({
        where: { id: productId }
      })
    }

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    if (!product.isModalProduct) {
      return NextResponse.json({ error: 'Apenas produtos modais podem ter modelos adicionados' }, { status: 400 })
    }

    let brand: any = null
    let model: any = null
    let productModel: any = null

    // Em produção, usar SQL direto para evitar problemas com Prisma Accelerate
    if (process.env.NODE_ENV === 'production') {
      console.log('📊 Using production SQL direct insert for new model')
      
      // Testar conexão primeiro
      const isConnected = await testConnection()
      if (!isConnected) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
      }
      
      // Encontrar ou criar marca
      brand = await findOrCreateBrand(brandName)
      
      // Encontrar ou criar modelo
      model = await findOrCreateModel(modelName, brand.id)
      
      // Verificar se já existe uma relação ProductModel para este produto e modelo
      const existingResult = await dbQuery(
        'SELECT id FROM "ProductModel" WHERE "productId" = $1 AND "modelId" = $2',
        [productId, model.id]
      )
      
      if (existingResult && existingResult.rows && existingResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'Este modelo já está cadastrado para este produto' },
          { status: 400 }
        )
      }
      
      // Criar relação produto-modelo com preços
      productModel = await createProductModel({
        productId,
        modelId: model.id,
        price: parseFloat(price),
        superWholesalePrice: superWholesalePrice ? parseFloat(superWholesalePrice) : null
      })
      
    } else {
      console.log('📊 Using development Prisma create for new model')
      
      // Em desenvolvimento, usar Prisma normalmente
      // Encontrar ou criar marca
      brand = await prisma.brand.findUnique({
        where: { name: brandName }
      })

      if (!brand) {
        brand = await prisma.brand.create({
          data: { name: brandName }
        })
      }

      // Encontrar ou criar modelo
      model = await prisma.model.findUnique({
        where: {
          brandId_name: {
            brandId: brand.id,
            name: modelName
          }
        }
      })

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: modelName,
            brandId: brand.id
          }
        })
      }

      // Verificar se já existe uma relação ProductModel para este produto e modelo
      const existingProductModel = await prisma.productModel.findFirst({
        where: {
          productId,
          modelId: model.id
        }
      })

      if (existingProductModel) {
        return NextResponse.json(
          { error: 'Este modelo já está cadastrado para este produto' },
          { status: 400 }
        )
      }

      // Criar relação produto-modelo com preços
      productModel = await prisma.productModel.create({
        data: {
          productId,
          modelId: model.id,
          price: parseFloat(price),
          superWholesalePrice: superWholesalePrice ? parseFloat(superWholesalePrice) : null
        }
      })
    }

    // Invalidar cache específico do produto
    invalidateProductCache(productId)
    revalidatePath('/admin/produtos')
    
    // Chamar webhook de sincronização
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('✅ Webhook de sincronização acionado após adicionar modelo')
    } catch (syncError) {
      console.warn('⚠️ Falha no webhook de sincronização:', syncError)
    }

    // Retornar dados no formato esperado pelo frontend
    const responseData = {
      id: model.id,
      brandName: brand.name,
      modelName: model.name,
      price: parseFloat(price),
      superWholesalePrice: superWholesalePrice ? parseFloat(superWholesalePrice) : null
    }

    return NextResponse.json(responseData, { status: 201 })

  } catch (error) {
    console.error('Erro ao adicionar modelo ao produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}