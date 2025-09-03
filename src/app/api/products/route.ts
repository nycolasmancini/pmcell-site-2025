import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { query as dbQuery, testConnection, createProduct, createProductImage } from '@/lib/db'
import { productsCache } from '@/lib/cache'
import { uploadImageBuffer, PRODUCT_UPLOAD_OPTIONS } from '@/lib/cloudinary'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const admin = searchParams.get('admin')
    const refresh = searchParams.get('refresh')
    
    // Se refresh=true, limpar cache
    if (refresh === 'true') {
      productsCache.clear()
      console.log('🔄 Cache de produtos limpo por parâmetro refresh')
    }
    
    console.log('🔍 Products API called:', {
      NODE_ENV: process.env.NODE_ENV,
      admin: admin,
      url: request.url,
      refresh: refresh,
      userAgent: request.headers.get('user-agent')?.substring(0, 50)
    })
    
    // Em produção, usar conexão direta por enquanto  
    if (process.env.NODE_ENV === 'production') {
      console.log('📊 Using production SQL query path')
      
      // Testar conexão primeiro
      const isConnected = await testConnection()
      if (!isConnected) {
        console.error('❌ Database connection test failed')
        return NextResponse.json({ 
          error: 'Database connection failed',
          products: [],
          pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
        }, { status: 500 })
      }

      try {
        const categoryId = searchParams.get('categoryId')
        const featured = searchParams.get('featured')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '12')
        const offset = (page - 1) * limit

        let whereConditions = []
        let queryParams = []

        // Para requisições admin, mostrar todos os produtos. Para público, apenas ativos
        if (admin !== 'true') {
          whereConditions.push('p."isActive" = true')
        }

        if (categoryId) {
          whereConditions.push('p."categoryId" = $' + (queryParams.length + 1))
          queryParams.push(categoryId)
        }

        if (featured === 'true') {
          whereConditions.push('p."featured" = $' + (queryParams.length + 1))
          queryParams.push(true)
        }

        if (search) {
          const searchParam = queryParams.length + 1
          whereConditions.push(`(
            p."name" ILIKE $${searchParam} OR 
            p."description" ILIKE $${searchParam} OR 
            p."brand" ILIKE $${searchParam}
          )`)
          queryParams.push(`%${search}%`)
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

        // Adicionar limit e offset aos parâmetros ANTES de construir a query
        queryParams.push(limit, offset)

        // Query para produtos com imagens e modelos
        const productsQuery = `
          SELECT 
            p.id, p.name, p.subname, p.description, p.brand, p.price, 
            p."superWholesalePrice", 
            p."superWholesaleQuantity",
            p.cost, p."categoryId", p.featured, p."isModalProduct",
            p."quickAddIncrement",
            p."isActive", p."createdAt",
            c.name as category_name,
            COALESCE(
              JSON_AGG(
                CASE WHEN i.id IS NOT NULL THEN
                  JSON_BUILD_OBJECT(
                    'id', i.id,
                    'url', i.url,
                    'fileName', i."fileName",
                    'order', i."order",
                    'isMain', i."isMain"
                  )
                END ORDER BY i."order", i.id
              ) FILTER (WHERE i.id IS NOT NULL),
              '[]'::json
            ) as images,
            COALESCE(
              JSON_AGG(
                CASE WHEN pm.id IS NOT NULL THEN
                  JSON_BUILD_OBJECT(
                    'id', m.id,
                    'brandName', b.name,
                    'modelName', m.name,
                    'price', pm.price,
                    'superWholesalePrice', pm."superWholesalePrice"
                  )
                END ORDER BY m.id
              ) FILTER (WHERE pm.id IS NOT NULL),
              '[]'::json
            ) as models
          FROM "Product" p
          LEFT JOIN "Category" c ON c.id = p."categoryId"
          LEFT JOIN "ProductImage" i ON i."productId" = p.id
          LEFT JOIN "ProductModel" pm ON pm."productId" = p.id
          LEFT JOIN "Model" m ON m.id = pm."modelId"
          LEFT JOIN "Brand" b ON b.id = m."brandId"
          ${whereClause}
          GROUP BY p.id, c.name
          ORDER BY p."createdAt" DESC
          LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
        `

        // Query para contar total
        const countQuery = `
          SELECT COUNT(*) as total
          FROM "Product" p
          ${whereClause}
        `
        const countParams = queryParams.slice(0, -2) // Remove limit e offset

        console.log('🎯 Executing queries with params:', {
          queryParamsLength: queryParams.length,
          countParamsLength: countParams.length,
          whereClause: whereClause
        })
        
        const [productsResult, totalResult] = await Promise.all([
          dbQuery(productsQuery, queryParams),
          dbQuery(countQuery, countParams)
        ])

        console.log('📊 Query results:', {
          productsRows: productsResult?.rows?.length || 0,
          totalRows: totalResult?.rows?.length || 0,
          firstProductId: productsResult?.rows?.[0]?.id || 'none'
        })

        if (!productsResult || !productsResult.rows) {
          throw new Error('No data returned from products query')
        }

        if (!totalResult || !totalResult.rows || totalResult.rows.length === 0) {
          throw new Error('No total count returned from database')
        }

        const products = productsResult.rows.map((row: any) => {
          
          const models = Array.isArray(row.models) ? row.models : []
          const hasModels = models.length > 0
          
          // Para produtos modais, calcular price range baseado nos modelos
          let priceRange = null
          if (row.isModalProduct && hasModels) {
            const prices = models.map((m: any) => m.price || 0).filter((p: number) => p > 0)
            const superWholesalePrices = models
              .map((m: any) => m.superWholesalePrice)
              .filter((p: number) => p && p > 0)
            
            if (prices.length > 0) {
              priceRange = {
                min: Math.min(...prices),
                max: Math.max(...prices),
                superWholesaleMin: superWholesalePrices.length > 0 ? Math.min(...superWholesalePrices) : null,
                superWholesaleMax: superWholesalePrices.length > 0 ? Math.max(...superWholesalePrices) : null
              }
            }
          }
          
          // Acessar valores de super atacado com fallback
          const superPrice = row.superWholesalePrice || row.superwholesaleprice || row['superWholesalePrice'] || null;
          const superQty = row.superWholesaleQuantity || row.superwholesalequantity || row['superWholesaleQuantity'] || null;
          
          const processedProduct = {
            id: row.id,
            name: row.name,
            subname: row.subname,
            description: row.description,
            brand: row.brand,
            price: parseFloat(row.price || 0),
            superWholesalePrice: superPrice ? parseFloat(superPrice) : null,
            superWholesaleQuantity: superQty ? parseInt(superQty) : null,
            cost: row.cost ? parseFloat(row.cost) : null,
            categoryId: row.categoryId,
            featured: row.featured || false,
            isModalProduct: row.isModalProduct || false,
            quickAddIncrement: row.quickAddIncrement || row.quickaddincrement || null,
            isActive: row.isActive,
            createdAt: row.createdAt,
            // Campos relacionais
            category: { name: row.category_name || 'Sem categoria' },
            images: Array.isArray(row.images) ? row.images : [],
            suppliers: [],
            models,
            hasModels,
            priceRange
          }
          
          return processedProduct
        })

        const total = parseInt(totalResult.rows[0].total)

        const response = {
          products,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }

        console.log('✅ Production API returning:', {
          productsCount: products.length,
          total: total,
          page: page,
          hasProducts: products.length > 0,
          firstProductName: products[0]?.name || 'none'
        })

        return NextResponse.json(response)
      } catch (error) {
        console.error('Production query error:', error)
        
        // Log detalhado do erro para debug
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          })
        }
        
        // Retornar resposta vazia em caso de erro ao invés de falhar completamente
        return NextResponse.json({
          products: [],
          pagination: {
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0
          },
          error: 'Database connection failed',
          errorDetails: undefined
        })
      }
    }

    // Em desenvolvimento, usar Prisma
    console.log('📊 Using development Prisma query path')
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: any = {}

    // For admin requests, show all products. For public, only show active products
    if (admin !== 'true') {
      where.isActive = true
    }


    if (categoryId) {
      where.categoryId = categoryId
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          images: {
            select: {
              id: true,
              url: true,
              isMain: true,
              order: true
            },
            orderBy: { order: 'asc' }
          },
          models: {
            include: {
              model: {
                include: {
                  brand: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    // Processar produtos com cálculo de price ranges para produtos modais
    const processedProducts = products.map((product: any) => {
      const hasModels = product.models && product.models.length > 0
      
      // Para produtos modais, calcular price range baseado nos modelos
      let priceRange = null
      if (product.isModalProduct && hasModels) {
        const prices = product.models.map((pm: any) => pm.price || 0).filter((p: number) => p > 0)
        const superWholesalePrices = product.models
          .map((pm: any) => pm.superWholesalePrice)
          .filter((p: number) => p && p > 0)
        
        if (prices.length > 0) {
          priceRange = {
            min: Math.min(...prices),
            max: Math.max(...prices),
            superWholesaleMin: superWholesalePrices.length > 0 ? Math.min(...superWholesalePrices) : null,
            superWholesaleMax: superWholesalePrices.length > 0 ? Math.max(...superWholesalePrices) : null
          }
        }
      }
      
      return {
        ...product,
        hasModels,
        priceRange,
        // Simplificar relacionamentos complexos mas manter dados essenciais
        suppliers: [],
        models: hasModels ? product.models.map((pm: any) => ({
          id: pm.model.id,
          brandName: pm.model.brand.name,
          modelName: pm.model.name,
          price: pm.price,
          superWholesalePrice: pm.superWholesalePrice
        })) : []
      }
    })


    return NextResponse.json({
      products: processedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    
    // More detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      env: process.env.NODE_ENV
    })
    
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: process.env.NODE_ENV !== 'production' ? errorMessage : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Debug: Log todos os campos recebidos
    console.log('🔍 FormData recebido:', {
      name: formData.get('name'),
      subname: formData.get('subname'),
      description: formData.get('description'),
      brand: formData.get('brand'),
      price: formData.get('price'),
      superWholesalePrice: formData.get('superWholesalePrice'),
      superWholesaleQuantity: formData.get('superWholesaleQuantity'),
      cost: formData.get('cost'),
      categoryId: formData.get('categoryId'),
      supplierName: formData.get('supplierName'),
      supplierPhone: formData.get('supplierPhone')
    })
    
    // Extrair dados do formulário
    const name = formData.get('name') as string
    
    // Validação obrigatória
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do produto é obrigatório' },
        { status: 400 }
      )
    }
    const subname = formData.get('subname') as string
    const subnameValue = subname && subname.trim() !== '' ? subname : null
    const description = formData.get('description') as string
    const brand = formData.get('brand') as string
    const brandValue = brand && brand.trim() !== '' ? brand : null
    
    const priceStr = formData.get('price') as string
    const price = parseFloat(priceStr)
    
    // Validação obrigatória
    if (!priceStr || isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Preço deve ser um número válido maior que zero' },
        { status: 400 }
      )
    }
    
    const superWholesalePriceStr = formData.get('superWholesalePrice') as string
    const superWholesalePrice = superWholesalePriceStr && superWholesalePriceStr.trim() !== '' ? 
      parseFloat(superWholesalePriceStr) : null
    
    const superWholesaleQuantityStr = formData.get('superWholesaleQuantity') as string
    const superWholesaleQuantity = superWholesaleQuantityStr && superWholesaleQuantityStr.trim() !== '' ? 
      parseInt(superWholesaleQuantityStr) : null
    
    const costStr = formData.get('cost') as string
    const cost = costStr && costStr.trim() !== '' ? parseFloat(costStr) : null
    
    const categoryIdStr = formData.get('categoryId') as string
    const categoryId = categoryIdStr && categoryIdStr.trim() !== '' ? categoryIdStr : null
    
    // Validação obrigatória
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Categoria é obrigatória' },
        { status: 400 }
      )
    }
    
    const supplierNameStr = formData.get('supplierName') as string
    const supplierName = supplierNameStr && supplierNameStr.trim() !== '' ? supplierNameStr : null
    
    const supplierPhoneStr = formData.get('supplierPhone') as string
    const supplierPhone = supplierPhoneStr && supplierPhoneStr.trim() !== '' ? supplierPhoneStr : null

    // Debug: Log dados processados
    console.log('📋 Dados processados para criação:', {
      name,
      subname: subnameValue,
      description,
      brand: brandValue,
      price,
      superWholesalePrice,
      superWholesaleQuantity,
      cost,
      categoryId
    })

    // Processar imagens - Upload para Cloudinary
    const imageFiles = formData.getAll('images') as File[]
    const uploadedImages: { url: string; fileName: string; isMain: boolean; cloudinaryId: string }[] = []

    console.log(`Processando ${imageFiles.length} imagens`)

    // Processar cada imagem
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      console.log(`Arquivo ${i}: nome=${file.name}, tamanho=${file.size}, tipo=${file.type}`)
      
      if (file.size > 0) {
        try {
          // Verificar tamanho do arquivo (máximo 10MB para Cloudinary)
          if (file.size > 10485760) {
            console.error(`Arquivo ${file.name} é muito grande (${file.size} bytes)`)
            continue
          }

          // Converter File para Buffer
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          
          // Upload para Cloudinary
          const uploadResult = await uploadImageBuffer(buffer, {
            ...PRODUCT_UPLOAD_OPTIONS,
            public_id: `product_${Date.now()}_${i}`,
          })
          
          uploadedImages.push({
            url: uploadResult.secure_url,
            fileName: file.name,
            isMain: i === 0, // Primeira imagem é a principal
            cloudinaryId: uploadResult.public_id,
          })
          console.log(`Imagem ${i} enviada para Cloudinary: ${uploadResult.secure_url}`)
        } catch (error) {
          console.error('Erro ao processar imagem:', error)
          continue
        }
      } else {
        console.log(`Arquivo ${i} tem tamanho 0, ignorando`)
      }
    }

    console.log(`Total de imagens enviadas para Cloudinary: ${uploadedImages.length}`)

    // Permitir produtos sem imagens para teste
    // if (uploadedImages.length === 0) {
    //   return NextResponse.json(
    //     { error: 'Nenhuma imagem válida foi enviada. Verifique se os arquivos não estão corrompidos.' },
    //     { status: 400 }
    //   )
    // }

    // Criar produto no banco de dados
    let product
    
    // Em produção, usar SQL direto para evitar problemas com Prisma Accelerate
    if (process.env.NODE_ENV === 'production') {
      console.log('📊 Using production SQL direct insert for product')
      
      // Testar conexão primeiro
      const isConnected = await testConnection()
      if (!isConnected) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
      }
      
      // Criar produto via SQL direto
      product = await createProduct({
        name,
        subname: subnameValue,
        description,
        brand: brandValue,
        price,
        superWholesalePrice,
        superWholesaleQuantity,
        cost,
        categoryId
      })
      
      // Criar imagens se houver alguma
      if (uploadedImages.length > 0) {
        for (let i = 0; i < uploadedImages.length; i++) {
          const image = uploadedImages[i]
          await createProductImage({
            productId: product.id,
            url: image.url,
            fileName: image.fileName,
            cloudinaryId: image.cloudinaryId,
            order: i,
            isMain: image.isMain
          })
        }
      }
      
    } else {
      console.log('📊 Using development Prisma create for product')
      
      // Em desenvolvimento, usar Prisma normalmente
      product = await prisma.product.create({
        data: {
          name,
          subname: subnameValue,
          description,
          brand: brandValue,
          price,
          superWholesalePrice,
          superWholesaleQuantity,
          cost,
          categoryId,
          // Só criar imagens se houver alguma
          ...(uploadedImages.length > 0 && {
            images: {
              create: uploadedImages.map((img, index) => ({
                url: img.url,
                fileName: img.fileName,
                cloudinaryId: img.cloudinaryId,
                order: index,
                isMain: img.isMain
              }))
            }
          })
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              order: true,
              isActive: true,
              createdAt: true,
              updatedAt: true
            }
          },
          images: true
        }
      })
    }

    // Debug: Log produto criado
    // Limpar cache de produtos após criação
    productsCache.clear()
    console.log('🔄 Cache de produtos limpo após criação')
    
    // Chamar webhook de sincronização para revalidar todas as páginas
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('✅ Webhook de sincronização acionado')
    } catch (syncError) {
      console.warn('⚠️ Falha no webhook de sincronização:', syncError)
    }
    
    console.log('✅ Produto criado com sucesso:', {
      id: product.id,
      name: product.name,
      price: product.price,
      superWholesalePrice: product.superWholesalePrice,
      superWholesaleQuantity: product.superWholesaleQuantity,
      subname: product.subname,
      brand: product.brand,
      cost: product.cost
    })

    // Criar/associar fornecedor se fornecido
    if (supplierName) {
      try {
        // Procurar fornecedor existente ou criar novo
        let supplier = await prisma.supplier.findFirst({
          where: { name: supplierName }
        })

        if (!supplier) {
          supplier = await prisma.supplier.create({
            data: {
              name: supplierName,
              phone: supplierPhone
            }
          })
        }

        // Associar produto ao fornecedor
        await prisma.productSupplier.create({
          data: {
            productId: product.id,
            supplierId: supplier.id,
            cost: cost || 0
          }
        })
        
        console.log('✅ Fornecedor associado ao produto:', supplierName)
      } catch (supplierError) {
        console.error('⚠️ Erro ao associar fornecedor (produto criado com sucesso):', supplierError)
        // Não falhar a criação do produto por causa do supplier
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    )
  }
}