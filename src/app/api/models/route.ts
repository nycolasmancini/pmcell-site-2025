import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { name, brandId } = await request.json()

    if (!name?.trim() || !brandId) {
      return NextResponse.json(
        { error: 'Nome do modelo e marca são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a marca existe
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    })

    if (!brand) {
      return NextResponse.json(
        { error: 'Marca não encontrada' },
        { status: 404 }
      )
    }

    const model = await prisma.model.create({
      data: {
        name: name.trim(),
        brandId
      },
      include: {
        brand: true
      }
    })

    return NextResponse.json(model, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar model:', error)
    
    // Verificar se é erro de unique constraint
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um modelo com este nome para esta marca' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}