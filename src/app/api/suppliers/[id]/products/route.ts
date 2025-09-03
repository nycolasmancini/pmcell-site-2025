import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Em produção, usar conexão direta
    if (process.env.NODE_ENV === 'production') {
      const { Pool } = require('pg')
      const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
      
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      })

      try {
        const result = await pool.query(`
          SELECT 
            ps.id,
            ps."productId",
            ps."supplierId",
            ps.cost,
            ps."isActive",
            ps.notes,
            ps."createdAt",
            p.name as "productName"
          FROM "ProductSupplier" ps
          JOIN "Product" p ON p.id = ps."productId"
          WHERE ps."supplierId" = $1
          ORDER BY p.name ASC
        `, [id])
        
        // Transformar para formato compatível com Prisma
        const products = result.rows.map((row: any) => ({
          id: row.id,
          productId: row.productId,
          supplierId: row.supplierId,
          cost: row.cost,
          isActive: row.isActive,
          notes: row.notes,
          createdAt: row.createdAt,
          product: {
            name: row.productName
          }
        }))

        return NextResponse.json(products)
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    const products = await prisma.productSupplier.findMany({
      where: { supplierId: id },
      include: {
        product: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        product: {
          name: 'asc'
        }
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Erro ao buscar produtos do fornecedor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}