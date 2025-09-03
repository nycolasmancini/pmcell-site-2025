import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProductWithImages, checkCategoryExists } from '@/lib/db'
import { isSchemaReady, initializeSchema } from '@/lib/init-schema'
import { productsCache } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando criação de produto com imagens...')
    
    const { productData, temporaryImages } = await request.json()

    console.log('📋 Dados recebidos:', {
      productName: productData?.name,
      imagesCount: temporaryImages?.length,
      categoryId: productData?.categoryId
    })

    // Validação completa dos dados
    if (!productData || !productData.name || !productData.categoryId || !productData.price) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios do produto estão faltando (name, categoryId, price)' 
      }, { status: 400 })
    }

    // Validar se produto tem pelo menos uma imagem
    if (!temporaryImages || temporaryImages.length === 0) {
      return NextResponse.json({ 
        error: 'Produto deve ter pelo menos uma imagem' 
      }, { status: 400 })
    }

    // Verificar se schema está pronto, se não, tentar inicializar
    let usePrisma = true
    let schemaInitialized = false
    
    try {
      const schemaOk = await isSchemaReady()
      if (!schemaOk) {
        console.log('⚠️ Schema não está pronto, tentando inicializar...')
        const initResult = await initializeSchema()
        schemaInitialized = initResult.success
        if (!schemaInitialized) {
          console.log('❌ Falha na inicialização, usando fallback SQL')
          usePrisma = false
        }
      }
    } catch (error) {
      console.log('❌ Erro ao verificar schema, usando fallback SQL')
      usePrisma = false
    }

    let result
    
    if (usePrisma) {
      try {
        console.log('🔵 Tentando criar produto via Prisma...')
        
        // Verificar se a categoria existe usando Prisma
        const categoryExists = await prisma.category.findUnique({
          where: { id: productData.categoryId }
        })
        
        if (!categoryExists) {
          return NextResponse.json({ 
            error: 'Categoria não encontrada' 
          }, { status: 400 })
        }

        // Usar transação do Prisma para atomicidade
        result = await prisma.$transaction(async (tx) => {
          // Criar produto no banco de dados
          const product = await tx.product.create({
            data: {
              name: productData.name,
              subname: productData.subname || null,
              description: productData.description || null,
              brand: productData.brand || null,
              price: parseFloat(productData.price),
              specialPrice: productData.specialPrice ? parseFloat(productData.specialPrice) : null,
              specialQuantity: productData.specialQuantity || null,
              superWholesalePrice: productData.superWholesalePrice ? parseFloat(productData.superWholesalePrice) : null,
              superWholesaleQuantity: productData.superWholesaleQuantity || null,
              cost: productData.cost ? parseFloat(productData.cost) : null,
              boxQuantity: productData.boxQuantity || null,
              categoryId: productData.categoryId,
              isActive: productData.isActive !== false,
              featured: productData.featured || false,
              isModalProduct: productData.isModalProduct || false,
              quickAddIncrement: productData.quickAddIncrement || null
            }
          })

          console.log('✅ Produto criado via Prisma:', product.id)

          // Criar as imagens associadas ao produto
          const imageCreatePromises = temporaryImages.map((tempImage: any, index: number) => {
            return tx.productImage.create({
              data: {
                productId: product.id,
                url: tempImage.url || tempImage.secure_url,
                fileName: tempImage.fileName,
                order: tempImage.order !== undefined ? tempImage.order : index,
                isMain: tempImage.isMain !== undefined ? tempImage.isMain : index === 0,
                cloudinaryPublicId: tempImage.cloudinaryPublicId || tempImage.public_id,
                thumbnailUrl: tempImage.thumbnailUrl,
                normalUrl: tempImage.normalUrl,
                width: tempImage.width || null,
                height: tempImage.height || null,
                fileSize: tempImage.fileSize || tempImage.bytes || null
              }
            })
          })

          const createdImages = await Promise.all(imageCreatePromises)
          
          console.log(`✅ ${createdImages.length} imagens associadas via Prisma`)
          
          return { product, images: createdImages }
        })
        
      } catch (prismaError) {
        console.error('❌ Erro no Prisma, tentando fallback SQL:', prismaError)
        usePrisma = false
      }
    }
    
    // Se Prisma falhou ou não estava disponível, usar SQL direto
    if (!usePrisma) {
      console.log('🟡 Usando fallback SQL para criar produto...')
      
      // Verificar categoria via SQL
      const categoryExists = await checkCategoryExists(productData.categoryId)
      if (!categoryExists) {
        return NextResponse.json({ 
          error: 'Categoria não encontrada' 
        }, { status: 400 })
      }
      
      // Criar produto via SQL direto
      result = await createProductWithImages({
        name: productData.name,
        subname: productData.subname || null,
        description: productData.description || null,
        brand: productData.brand || null,
        price: parseFloat(productData.price),
        specialPrice: productData.specialPrice ? parseFloat(productData.specialPrice) : null,
        specialQuantity: productData.specialQuantity || null,
        superWholesalePrice: productData.superWholesalePrice ? parseFloat(productData.superWholesalePrice) : null,
        superWholesaleQuantity: productData.superWholesaleQuantity || null,
        cost: productData.cost ? parseFloat(productData.cost) : null,
        boxQuantity: productData.boxQuantity || null,
        categoryId: productData.categoryId,
        isActive: productData.isActive !== false,
        featured: productData.featured || false,
        isModalProduct: productData.isModalProduct || false,
        quickAddIncrement: productData.quickAddIncrement || null
      }, temporaryImages)
    }

    if (!result) {
      throw new Error('Falha na criação do produto - nenhum resultado retornado')
    }

    // Limpar cache de produtos após criação bem-sucedida
    productsCache.clear()
    console.log('🔄 Cache de produtos limpo após criação bem-sucedida')
    
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
    
    console.log(`✅ Produto criado com sucesso:`, {
      productId: result.product.id,
      productName: result.product.name,
      imagesCount: result.images.length,
      method: usePrisma ? 'Prisma' : 'SQL'
    })

    return NextResponse.json({ 
      message: 'Produto criado com sucesso!',
      product: {
        ...result.product,
        images: result.images
      }
    })

  } catch (error) {
    console.error('❌ Erro ao criar produto com imagens:', error)
    
    // Retornar erro mais detalhado
    if (error instanceof Error) {
      console.error('❌ Stack trace:', error.stack)
      
      // Verificar se é erro específico do Prisma
      if (error.message.includes('P2021')) {
        return NextResponse.json({ 
          error: 'Tabelas do banco de dados não encontradas. Execute a sincronização do schema.',
          code: 'DB_SCHEMA_ERROR'
        }, { status: 500 })
      }
      
      if (error.message.includes('P2002')) {
        return NextResponse.json({ 
          error: 'Produto com este nome já existe',
          code: 'DUPLICATE_PRODUCT'
        }, { status: 400 })
      }
      
      return NextResponse.json({ 
        error: `Erro detalhado: ${error.message}`,
        code: 'UNKNOWN_ERROR'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}