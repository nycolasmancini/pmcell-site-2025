import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
        email: data.email || null,
        notes: data.notes || null,
      }
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}