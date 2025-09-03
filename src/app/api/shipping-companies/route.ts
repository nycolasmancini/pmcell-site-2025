import { NextRequest, NextResponse } from 'next/server'
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
          SELECT * FROM "ShippingCompany" 
          WHERE "isActive" = true 
          ORDER BY "order" ASC
        `)
        
        return NextResponse.json(result.rows)
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    const shippingCompanies = await prisma.shippingCompany.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(shippingCompanies)
  } catch (error) {
    console.error('Erro ao buscar transportadoras:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, logo, order } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
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
        // Verificar se já existe uma transportadora com o mesmo nome
        const existingResult = await pool.query(`
          SELECT id FROM "ShippingCompany" WHERE name = $1
        `, [name])

        if (existingResult.rows.length > 0) {
          return NextResponse.json({ error: 'Já existe uma transportadora com este nome' }, { status: 409 })
        }

        // Gerar ID único
        const { randomBytes } = require('crypto')
        const id = randomBytes(12).toString('base64url')
        
        const result = await pool.query(`
          INSERT INTO "ShippingCompany" (id, name, logo, "order", "isActive", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, true, NOW(), NOW())
          RETURNING *
        `, [
          id,
          name,
          logo || null,
          order || 0
        ])

        return NextResponse.json(result.rows[0], { status: 201 })
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    const shippingCompany = await prisma.shippingCompany.create({
      data: {
        name,
        logo,
        order: order || 0
      }
    })

    return NextResponse.json(shippingCompany, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar transportadora:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe uma transportadora com este nome' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}