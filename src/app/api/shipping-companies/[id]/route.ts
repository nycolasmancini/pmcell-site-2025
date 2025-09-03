import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const shippingCompany = await prisma.shippingCompany.findUnique({
      where: { id }
    })

    if (!shippingCompany) {
      return NextResponse.json({ error: 'Transportadora não encontrada' }, { status: 404 })
    }

    return NextResponse.json(shippingCompany)
  } catch (error) {
    console.error('Erro ao buscar transportadora:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, logo, isActive, order } = body

    const shippingCompany = await prisma.shippingCompany.update({
      where: { id },
      data: {
        name,
        logo,
        isActive,
        order
      }
    })

    return NextResponse.json(shippingCompany)
  } catch (error: any) {
    console.error('Erro ao atualizar transportadora:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe uma transportadora com este nome' }, { status: 409 })
    }

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Transportadora não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.shippingCompany.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar transportadora:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Transportadora não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}