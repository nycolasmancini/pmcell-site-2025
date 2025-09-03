import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { query as dbQuery, testConnection } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    let product
    
    try {
      product = await prisma.product.findUnique({
        where: { id },
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
          images: {
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
          },
          suppliers: {
            where: { isActive: true },
            include: {
              supplier: true
            }
          }
        }
      })
    } catch (prismaError: any) {
      if (prismaError.code === 'P2021' && process.env.NODE_ENV === 'production') {
        // Fallback: usar SQL direto
        console.log('🔄 Usando SQL direto para buscar produto em produção...')
        const { query: dbQuery } = await import('@/lib/db')
        
        const fullProductQuery = `
          SELECT 
            p.*,
            json_build_object(
              'id', c.id,
              'name', c.name,
              'slug', c.slug,
              'order', c."order",
              'isActive', c."isActive",
              'createdAt', c."createdAt",
              'updatedAt', c."updatedAt"
            ) as category
          FROM "Product" p
          LEFT JOIN "Category" c ON c.id = p."categoryId"
          WHERE p.id = $1
        `
        
        const result = await dbQuery(fullProductQuery, [id])
        product = result?.rows?.[0]
        
        if (product) {
          // Buscar imagens separadamente
          try {
            const imagesResult = await dbQuery(
              'SELECT * FROM "ProductImage" WHERE "productId" = $1 ORDER BY "order"',
              [id]
            )
            product.images = imagesResult?.rows || []
          } catch (imageError) {
            console.warn('⚠️ Tabela ProductImage não encontrada, definindo array vazio')
            product.images = []
          }
          
          // Definir arrays vazios para campos não implementados no SQL direto
          product.models = []
          product.suppliers = []
        }
      } else {
        throw prismaError
      }
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Debug: Log produto retornado para edição
    console.log('📤 Produto retornado para edição:', {
      id: product.id,
      name: product.name,
      subname: product.subname,
      brand: product.brand,
      price: product.price,
      superWholesalePrice: product.superWholesalePrice,
      superWholesaleQuantity: product.superWholesaleQuantity,
      cost: product.cost
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const contentType = request.headers.get('content-type')
    
    // Suportar tanto JSON quanto FormData
    let productData: any
    let imageFiles: File[] = []
    
    if (contentType?.includes('application/json')) {
      // Modo JSON - apenas dados do produto (imagens gerenciadas separadamente)
      productData = await request.json()
    } else {
      // Modo FormData - compatibilidade com código legado
      const formData = await request.formData()
      productData = {
        name: formData.get('name') as string,
        subname: formData.get('subname') as string,
        description: formData.get('description') as string,
        brand: formData.get('brand') as string,
        price: parseFloat(formData.get('price') as string),
        superWholesalePrice: formData.get('superWholesalePrice') ? parseFloat(formData.get('superWholesalePrice') as string) : null,
        superWholesaleQuantity: formData.get('superWholesaleQuantity') ? parseInt(formData.get('superWholesaleQuantity') as string) : null,
        cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : null,
        categoryId: formData.get('categoryId') as string,
        isActive: formData.get('isActive') === 'true'
      }
      imageFiles = formData.getAll('images') as File[]
    }
    
    // Debug: Log dados recebidos para edição
    console.log('🔍 PUT dados recebidos para produto:', id, productData)
    
    // Verificar se o produto existe
    let existingProduct
    if (process.env.NODE_ENV === 'production') {
      console.log('📊 Using production SQL direct query for product update')
      
      // Testar conexão primeiro
      const isConnected = await testConnection()
      if (!isConnected) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
      }

      const productResult = await dbQuery(
        'SELECT * FROM "Product" WHERE "id" = $1', 
        [id]
      )
      if (!productResult || !productResult.rows) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      existingProduct = productResult.rows[0]
    } else {
      existingProduct = await prisma.product.findUnique({
        where: { id },
        include: {
          images: true,
          suppliers: true
        }
      })
    }

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Usar dados já estruturados do productData
    const {
      name,
      subname,
      description,
      brand,
      price,
      superWholesalePrice,
      superWholesaleQuantity,
      cost,
      categoryId,
      isActive
    } = productData

    // Debug: Log dados processados para edição
    console.log('📋 Dados processados para edição:', productData)

    // Processar novas imagens se houver (apenas em modo FormData)
    const uploadedImages: { url: string; fileName: string; isMain: boolean }[] = []

    if (imageFiles.length > 0) {
      console.log(`Processando ${imageFiles.length} novas imagens`)

      // Processar cada imagem
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        console.log(`Arquivo ${i}: nome=${file.name}, tamanho=${file.size}, tipo=${file.type}`)
        
        if (file.size > 0) {
          try {
            // Verificar tamanho do arquivo (máximo 5MB)
            if (file.size > 5242880) {
              console.error(`Arquivo ${file.name} é muito grande (${file.size} bytes)`)
              continue
            }

            // Converter File para ArrayBuffer e depois para Base64
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
            
            uploadedImages.push({
              url: base64,
              fileName: file.name,
              isMain: false // Novas imagens não são principais por padrão
            })
            console.log(`Imagem ${i} processada com sucesso: ${file.name}`)
          } catch (error) {
            console.error('Erro ao processar imagem:', error)
            continue
          }
        }
      }
    }

    // Atualizar produto no banco de dados
    let updatedProduct
    if (process.env.NODE_ENV === 'production') {
      // Atualizar produto via SQL direto
      const updateQuery = `
        UPDATE "Product" 
        SET 
          "name" = $1,
          "subname" = $2,
          "description" = $3,
          "brand" = $4,
          "price" = $5,
          "superWholesalePrice" = $6,
          "superWholesaleQuantity" = $7,
          "cost" = $8,
          "categoryId" = $9,
          "isActive" = $10,
          "updatedAt" = $11
        WHERE "id" = $12
        RETURNING *
      `
      
      const updateParams = [
        name,
        subname,
        description,
        brand,
        price,
        superWholesalePrice,
        superWholesaleQuantity,
        cost,
        categoryId,
        isActive,
        new Date(),
        id
      ]
      
      const updateResult = await dbQuery(updateQuery, updateParams)
      if (!updateResult || !updateResult.rows) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
      }
      updatedProduct = updateResult.rows[0]
      
      // Adicionar novas imagens se houver
      if (uploadedImages.length > 0) {
        // Buscar número de imagens existentes
        const countResult = await dbQuery(
          'SELECT COUNT(*) as count FROM "ProductImage" WHERE "productId" = $1',
          [id]
        )
        if (!countResult || !countResult.rows) {
          return NextResponse.json({ error: 'Failed to query images' }, { status: 500 })
        }
        const existingImageCount = parseInt(countResult.rows[0].count)
        
        // Inserir novas imagens
        for (let i = 0; i < uploadedImages.length; i++) {
          const img = uploadedImages[i]
          const imageId = `cm${Math.random().toString(36).substring(2, 15)}`
          
          await dbQuery(`
            INSERT INTO "ProductImage" ("id", "productId", "url", "fileName", "order", "isMain", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            imageId,
            id,
            img.url,
            img.fileName,
            existingImageCount + i,
            img.isMain,
            new Date()
          ])
        }
      }
      
      // Buscar produto com categoria e imagens para retorno
      const fullProductQuery = `
        SELECT 
          p.*,
          json_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug,
            'order', c.order,
            'isActive', c."isActive",
            'createdAt', c."createdAt",
            'updatedAt', c."updatedAt"
          ) as category,
          COALESCE(
            json_agg(
              json_build_object(
                'id', i.id,
                'url', i.url,
                'fileName', i."fileName",
                'order', i.order,
                'isMain', i."isMain"
              ) ORDER BY i.order
            ) FILTER (WHERE i.id IS NOT NULL),
            '[]'::json
          ) as images
        FROM "Product" p
        LEFT JOIN "Category" c ON c.id = p."categoryId"
        LEFT JOIN "ProductImage" i ON i."productId" = p.id
        WHERE p.id = $1
        GROUP BY p.id, c.id, c.name, c.slug, c.order, c."isActive", c."createdAt", c."updatedAt"
      `
      
      const fullProductResult = await dbQuery(fullProductQuery, [id])
      if (!fullProductResult || !fullProductResult.rows) {
        return NextResponse.json({ error: 'Failed to fetch updated product' }, { status: 500 })
      }
      updatedProduct = fullProductResult.rows[0]
      
    } else {
      // Em desenvolvimento, usar Prisma normalmente
      updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          name,
          subname,
          description,
          brand,
          price,
          superWholesalePrice,
          superWholesaleQuantity,
          cost,
          categoryId,
          isActive,
          // Adicionar novas imagens se houver
          ...(uploadedImages.length > 0 && {
            images: {
              create: uploadedImages.map((img, index) => ({
                url: img.url,
                fileName: img.fileName,
                order: existingProduct.images.length + index,
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
          images: {
            orderBy: { order: 'asc' }
          }
        }
      })
    }

    // TODO: Implementar fornecedor em versão futura se necessário

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { isActive } = body

    // Verificar se o produto existe - com fallback para produção
    let existingProduct
    try {
      existingProduct = await prisma.product.findUnique({
        where: { id }
      })
    } catch (findError: any) {
      if (findError.code === 'P2021' && process.env.NODE_ENV === 'production') {
        // Fallback: verificar usando SQL direto
        const { query: dbQuery } = await import('@/lib/db')
        const result = await dbQuery('SELECT * FROM "Product" WHERE "id" = $1', [id])
        existingProduct = result?.rows?.[0] || null
      } else {
        throw findError
      }
    }

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Atualizar apenas o status de disponibilidade
    let updatedProduct
    try {
      updatedProduct = await prisma.product.update({
        where: { id },
        data: { isActive },
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
          images: {
            orderBy: { order: 'asc' }
          },
          suppliers: {
            where: { isActive: true },
            include: {
              supplier: true
            }
          }
        }
      })
    } catch (updateError: any) {
      if (updateError.code === 'P2021' && process.env.NODE_ENV === 'production') {
        // Fallback: usar SQL direto para atualizar
        console.log('🔄 Usando SQL direto para atualizar status em produção...')
        const { query: dbQuery, testConnection } = await import('@/lib/db')
        
        // Testar conexão primeiro
        const connected = await testConnection()
        if (!connected) {
          throw new Error('Não foi possível conectar ao banco de dados')
        }
        
        try {
          await dbQuery(
            'UPDATE "Product" SET "isActive" = $1, "updatedAt" = $2 WHERE "id" = $3',
            [isActive, new Date(), id]
          )
          
          // Buscar produto atualizado com categoria
          const fullProductQuery = `
            SELECT 
              p.*,
              json_build_object(
                'id', c.id,
                'name', c.name,
                'slug', c.slug,
                'order', c."order",
                'isActive', c."isActive",
                'createdAt', c."createdAt",
                'updatedAt', c."updatedAt"
              ) as category
            FROM "Product" p
            LEFT JOIN "Category" c ON c.id = p."categoryId"
            WHERE p.id = $1
          `
          
          const result = await dbQuery(fullProductQuery, [id])
          updatedProduct = result?.rows?.[0]
          
          if (updatedProduct) {
            // Buscar imagens separadamente
            try {
              const imagesResult = await dbQuery(
                'SELECT * FROM "ProductImage" WHERE "productId" = $1 ORDER BY "order"', 
                [id]
              )
              updatedProduct.images = imagesResult?.rows || []
            } catch (imageError: any) {
              console.warn('⚠️ Não foi possível buscar imagens:', imageError.message)
              updatedProduct.images = []
            }
            
            updatedProduct.suppliers = [] // Não implementado no SQL direto por simplicidade
          }
          
          console.log('✅ Status atualizado via SQL direto')
        } catch (sqlError: any) {
          console.error('❌ Erro no SQL direto:', sqlError)
          throw new Error(`Falha na atualização SQL: ${sqlError.message}`)
        }
      } else {
        throw updateError
      }
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Erro ao atualizar disponibilidade do produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Verificar se o produto existe - usar fallback para produção
    let existingProduct
    try {
      existingProduct = await prisma.product.findUnique({
        where: { id }
      })
    } catch (findError: any) {
      if (findError.code === 'P2021' && process.env.NODE_ENV === 'production') {
        // Fallback: verificar usando SQL direto se Prisma falhar
        const { query: dbQuery } = await import('@/lib/db')
        const result = await dbQuery('SELECT * FROM "Product" WHERE "id" = $1', [id])
        existingProduct = result?.rows?.[0] || null
      } else {
        throw findError
      }
    }

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Usar transação para excluir produto e todos os registros relacionados
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Excluir relações produto-fornecedor
        await tx.productSupplier.deleteMany({
          where: { productId: id }
        })

        // 2. Excluir relações produto-modelo (para capas/películas)
        await tx.productModel.deleteMany({
          where: { productId: id }
        })

        // 3. Excluir itens de pedidos relacionados
        await tx.orderItem.deleteMany({
          where: { productId: id }
        })

        // 4. Excluir produtos de kits
        await tx.kitProduct.deleteMany({
          where: { productId: id }
        })

        // 5. Excluir produto (imagens serão excluídas automaticamente pelo cascade)
        await tx.product.delete({
          where: { id }
        })
      })
    } catch (transactionError: any) {
      if (transactionError.code === 'P2021' && process.env.NODE_ENV === 'production') {
        // Fallback: usar SQL direto para excluir em produção
        console.log('🔄 Usando SQL direto para excluir produto em produção...')
        const { query: dbQuery } = await import('@/lib/db')
        
        // Excluir em ordem de dependência
        await dbQuery('DELETE FROM "ProductSupplier" WHERE "productId" = $1', [id])
        await dbQuery('DELETE FROM "ProductModel" WHERE "productId" = $1', [id])
        await dbQuery('DELETE FROM "OrderItem" WHERE "productId" = $1', [id])
        await dbQuery('DELETE FROM "KitProduct" WHERE "productId" = $1', [id])
        await dbQuery('DELETE FROM "ProductImage" WHERE "productId" = $1', [id])
        await dbQuery('DELETE FROM "Product" WHERE "id" = $1', [id])
        
        console.log('✅ Produto excluído via SQL direto')
      } else {
        throw transactionError
      }
    }

    return NextResponse.json({ message: 'Produto excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir produto: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    )
  }
}