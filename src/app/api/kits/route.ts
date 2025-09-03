import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const kits = await prisma.kit.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        products: {
          include: {
            product: {
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
                }
              }
            }
          }
        }
      }
    })

    // Calcular preço total e preço com desconto para cada kit
    const kitsWithPrices = kits.map((kit: any) => {
      let totalPrice = 0
      
      kit.products.forEach((kitProduct: any) => {
        totalPrice += kitProduct.product.price * kitProduct.quantity
      })

      return {
        ...kit,
        totalPrice,
        finalPrice: totalPrice - kit.discount
      }
    })

    return NextResponse.json(kitsWithPrices)
  } catch (error) {
    console.error('Error fetching kits:', error)
    return NextResponse.json({ error: 'Failed to fetch kits' }, { status: 500 })
  }
}