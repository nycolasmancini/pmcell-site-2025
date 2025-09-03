import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { invalidateProductCache } from '@/lib/cache'
import { revalidatePath } from 'next/cache'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; modelId: string }> }
) {
  const { id: productId, modelId } = await params
  
  try {
    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Verificar se a relação produto-modelo existe
    const productModel = await prisma.productModel.findUnique({
      where: { id: modelId }
    })

    if (!productModel) {
      return NextResponse.json({ error: 'Modelo não encontrado' }, { status: 404 })
    }

    if (productModel.productId !== productId) {
      return NextResponse.json({ error: 'Modelo não pertence a este produto' }, { status: 400 })
    }

    // Remover a relação produto-modelo
    await prisma.productModel.delete({
      where: { id: modelId }
    })

    // Invalidar cache específico do produto
    invalidateProductCache(productId)
    revalidatePath('/admin/produtos')
    
    // Chamar webhook de sincronização
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('✅ Webhook de sincronização acionado após remover modelo')
    } catch (syncError) {
      console.warn('⚠️ Falha no webhook de sincronização:', syncError)
    }

    return NextResponse.json({ message: 'Modelo removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover modelo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; modelId: string }> }
) {
  const { id: productId, modelId } = await params
  
  try {
    const body = await request.json()
    const { price, superWholesalePrice } = body

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Verificar se a relação produto-modelo existe
    const productModel = await prisma.productModel.findUnique({
      where: { id: modelId }
    })

    if (!productModel) {
      return NextResponse.json({ error: 'Modelo não encontrado' }, { status: 404 })
    }

    if (productModel.productId !== productId) {
      return NextResponse.json({ error: 'Modelo não pertence a este produto' }, { status: 400 })
    }

    // Atualizar os preços do modelo
    const updatedProductModel = await prisma.productModel.update({
      where: { id: modelId },
      data: {
        price: parseFloat(price),
        superWholesalePrice: superWholesalePrice ? parseFloat(superWholesalePrice) : null
      },
      include: {
        model: {
          include: {
            brand: true
          }
        }
      }
    })

    // Invalidar cache específico do produto
    invalidateProductCache(productId)
    revalidatePath('/admin/produtos')
    
    // Chamar webhook de sincronização
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('✅ Webhook de sincronização acionado após atualizar modelo')
    } catch (syncError) {
      console.warn('⚠️ Falha no webhook de sincronização:', syncError)
    }

    return NextResponse.json(updatedProductModel)
  } catch (error) {
    console.error('Erro ao atualizar modelo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}