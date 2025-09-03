import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { categoryOrders } = body
    
    if (!Array.isArray(categoryOrders) || categoryOrders.length === 0) {
      return NextResponse.json({ error: 'CategoryOrders array is required' }, { status: 400 })
    }
    
    // Validate each item has id and order
    for (const item of categoryOrders) {
      if (!item.id || item.order === undefined || item.order === null) {
        return NextResponse.json({ 
          error: 'Each category must have id and order' 
        }, { status: 400 })
      }
    }

    // Em produção, usar conexão direta
    if (process.env.NODE_ENV === 'production') {
      const { Pool } = require('pg')
      const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
      
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      })

      try {
        // Use transaction for atomic updates
        await pool.query('BEGIN')
        
        for (const { id, order } of categoryOrders) {
          await pool.query(`
            UPDATE "Category" 
            SET "order" = $1, "updatedAt" = NOW()
            WHERE id = $2
          `, [parseInt(order), id])
        }
        
        await pool.query('COMMIT')
        
        // Return updated categories
        const result = await pool.query(`
          SELECT id, name, slug, "order", icon, "isActive", "createdAt", "updatedAt"
          FROM "Category" 
          WHERE "isActive" = true 
          ORDER BY "order" ASC
        `)
        
        return NextResponse.json({ 
          message: 'Categories reordered successfully',
          categories: result.rows
        })
      } catch (error) {
        await pool.query('ROLLBACK')
        throw error
      } finally {
        await pool.end()
      }
    }
    
    // Em desenvolvimento, usar Prisma
    // Use transaction for atomic updates
    await prisma.$transaction(async (tx) => {
      for (const { id, order } of categoryOrders) {
        await tx.category.update({
          where: { id },
          data: { order: parseInt(order) }
        })
      }
    })
    
    // Return updated categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json({ 
      message: 'Categories reordered successfully',
      categories
    })
  } catch (error) {
    console.error('Error reordering categories:', error)
    return NextResponse.json({ error: 'Failed to reorder categories' }, { status: 500 })
  }
}