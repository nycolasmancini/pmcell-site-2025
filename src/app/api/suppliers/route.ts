import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
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
          SELECT * FROM "Supplier" 
          WHERE "isActive" = true 
          ORDER BY name ASC
        `)
        
        return NextResponse.json(result.rows)
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      },
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
    
    // Em produção, usar conexão direta
    if (process.env.NODE_ENV === 'production') {
      const { Pool } = require('pg')
      const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
      
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      })

      try {
        // Gerar ID único
        const { randomBytes } = require('crypto')
        const id = randomBytes(12).toString('base64url')
        
        const result = await pool.query(`
          INSERT INTO "Supplier" (id, name, phone, address, email, notes, "isActive", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
          RETURNING *
        `, [
          id,
          data.name,
          data.phone || null,
          data.address || null,
          data.email || null,
          data.notes || null
        ])

        return NextResponse.json(result.rows[0])
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
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