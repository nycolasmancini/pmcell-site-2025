import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { testConnection, createProduct, createProductImage, findOrCreateBrand, findOrCreateModel, createProductModel, updateProduct, query as dbQuery } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const categoryId = formData.get('categoryId') as string
    const quickAddIncrement = parseInt(formData.get('quickAddIncrement') as string) || 25
    // Tentar buscar modelos temporários primeiro (novo formato)
    const tempModelsData = formData.get('tempModels') ? JSON.parse(formData.get('tempModels') as string) : null
    // Fallback para formato antigo se necessário
    const oldModelsData = formData.get('models') ? JSON.parse(formData.get('models') as string) : null
    
    const modelsData = tempModelsData || oldModelsData

    if (!name || !description || !categoryId) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    if (!modelsData || modelsData.length === 0) {
      return NextResponse.json({ error: 'Pelo menos um modelo deve ser adicionado' }, { status: 400 })
    }

    // Processar imagens - Usando Base64 como o endpoint principal
    const imageFiles = formData.getAll('images') as File[]
    const uploadedImages: { url: string; fileName: string; isMain: boolean }[] = []

    console.log(`Processando ${imageFiles.length} imagens para produto modal`)

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
            isMain: i === 0 // Primeira imagem é a principal
          })
          console.log(`Imagem ${i} processada com sucesso: ${file.name}`)
        } catch (error) {
          console.error('Erro ao processar imagem:', error)
          continue
        }
      } else {
        console.log(`Arquivo ${i} tem tamanho 0, ignorando`)
      }
    }

    console.log(`Total de imagens processadas: ${uploadedImages.length}`)

    if (uploadedImages.length === 0) {
      return NextResponse.json({ error: 'Pelo menos uma imagem deve ser enviada' }, { status: 400 })
    }

    // Criar produto principal de modal
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
        description,
        categoryId,
        isModalProduct: true,
        quickAddIncrement,
        price: 0 // Será definido pelos modelos
      })
      
      // Criar imagens
      for (let i = 0; i < uploadedImages.length; i++) {
        const img = uploadedImages[i]
        await createProductImage({
          productId: product.id,
          url: img.url,
          fileName: img.fileName,
          order: i,
          isMain: img.isMain
        })
      }
      
    } else {
      console.log('📊 Using development Prisma create for modal product')
      
      // Em desenvolvimento, usar Prisma normalmente
      product = await prisma.product.create({
        data: {
          name,
          description,
          categoryId,
          isModalProduct: true,
          quickAddIncrement,
          price: 0, // Será definido pelos modelos
          isActive: true,
          images: {
            create: uploadedImages.map((img, index) => ({
              url: img.url,
              fileName: img.fileName,
              order: index,
              isMain: img.isMain
            }))
          }
        }
      })
    }

    // Processar modelos e coletar dados de preços
    const createdModels = []
    for (const modelData of modelsData) {
      // Suportar tanto formato antigo quanto novo
      const brandName = modelData.brandName || modelData.brand?.name
      const modelName = modelData.modelName || modelData.model?.name || modelData.name
      const price = modelData.price
      const superWholesalePrice = modelData.superWholesalePrice

      if (!brandName || !modelName || (!price && price !== 0)) {
        console.log('Modelo incompleto, pulando:', { brandName, modelName, price })
        continue // Pular modelos incompletos
      }

      let brand, model
      
      // Em produção, usar SQL direto para evitar problemas com Prisma Accelerate
      if (process.env.NODE_ENV === 'production') {
        // Encontrar ou criar marca
        brand = await findOrCreateBrand(brandName)
        
        // Encontrar ou criar modelo
        model = await findOrCreateModel(modelName, brand.id)
        
        // Criar relação produto-modelo com preços
        await createProductModel({
          productId: product.id,
          modelId: model.id,
          price: parseFloat(price),
          superWholesalePrice: superWholesalePrice ? parseFloat(superWholesalePrice) : null
        })
        
      } else {
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

        // Criar relação produto-modelo com preços
        await prisma.productModel.create({
          data: {
            productId: product.id,
            modelId: model.id,
            price: parseFloat(price),
            superWholesalePrice: superWholesalePrice ? parseFloat(superWholesalePrice) : null
          }
        })
      }
      
      // Coletar dados para atualização do produto
      createdModels.push({
        price: parseFloat(price),
        superWholesalePrice: superWholesalePrice ? parseFloat(superWholesalePrice) : null
      })
    }

    // Atualizar o produto com dados agregados dos modelos
    if (createdModels.length > 0) {
      const prices = createdModels.map(m => m.price).filter(p => p > 0)
      const superWholesalePrices = createdModels
        .map(m => m.superWholesalePrice)
        .filter((p): p is number => p !== null && p > 0)
      
      const updateData: any = {}
      
      if (prices.length > 0) {
        // Usar preço mínimo como preço padrão do produto
        updateData.price = Math.min(...prices)
      }
      
      // Se há preços de super atacado, definir valores agregados
      if (superWholesalePrices.length > 0) {
        updateData.superWholesalePrice = Math.min(...superWholesalePrices)
        // Usar uma quantidade padrão razoável para super atacado em produtos modais
        updateData.superWholesaleQuantity = 50
      }
      
      if (Object.keys(updateData).length > 0) {
        // Em produção, usar SQL direto para evitar problemas com Prisma Accelerate
        if (process.env.NODE_ENV === 'production') {
          await updateProduct(product.id, updateData)
        } else {
          await prisma.product.update({
            where: { id: product.id },
            data: updateData
          })
        }
      }
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
    console.error('Erro ao criar produto de modal:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}