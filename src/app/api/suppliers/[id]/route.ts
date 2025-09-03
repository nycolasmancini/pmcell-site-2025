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
          SELECT s.*, 
                 COUNT(ps.id)::integer as products_count
          FROM "Supplier" s
          LEFT JOIN "ProductSupplier" ps ON s.id = ps."supplierId" AND ps."isActive" = true
          WHERE s.id = $1
          GROUP BY s.id
        `, [id])
        
        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Fornecedor não encontrado' },
            { status: 404 }
          )
        }

        return NextResponse.json(result.rows[0])
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                isActive: true
              }
            }
          }
        }
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      )
    }

    // Adicionar contagem de produtos
    const supplierWithCount = {
      ...supplier,
      products_count: supplier.products.length
    }

    return NextResponse.json(supplierWithCount)
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
        const updateFields = []
        const updateValues = [id]
        let paramCount = 2

        if (data.name !== undefined) {
          updateFields.push(`name = $${paramCount}`)
          updateValues.push(data.name)
          paramCount++
        }
        if (data.phone !== undefined) {
          updateFields.push(`phone = $${paramCount}`)
          updateValues.push(data.phone || null)
          paramCount++
        }
        if (data.address !== undefined) {
          updateFields.push(`address = $${paramCount}`)
          updateValues.push(data.address || null)
          paramCount++
        }
        if (data.email !== undefined) {
          updateFields.push(`email = $${paramCount}`)
          updateValues.push(data.email || null)
          paramCount++
        }
        if (data.notes !== undefined) {
          updateFields.push(`notes = $${paramCount}`)
          updateValues.push(data.notes || null)
          paramCount++
        }
        if (data.isActive !== undefined) {
          updateFields.push(`"isActive" = $${paramCount}`)
          updateValues.push(data.isActive)
          paramCount++
        }

        updateFields.push(`"updatedAt" = NOW()`)

        const result = await pool.query(`
          UPDATE "Supplier" 
          SET ${updateFields.join(', ')}
          WHERE id = $1
          RETURNING *
        `, updateValues)

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Fornecedor não encontrado' },
            { status: 404 }
          )
        }

        return NextResponse.json(result.rows[0])
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.phone !== undefined) updateData.phone = data.phone || null
    if (data.address !== undefined) updateData.address = data.address || null
    if (data.email !== undefined) updateData.email = data.email || null
    if (data.notes !== undefined) updateData.notes = data.notes || null
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
        // Verificar se há produtos associados
        const productsCheck = await pool.query(`
          SELECT COUNT(*) as count 
          FROM "ProductSupplier" 
          WHERE "supplierId" = $1 AND "isActive" = true
        `, [id])

        if (parseInt(productsCheck.rows[0].count) > 0) {
          return NextResponse.json(
            { error: 'Não é possível excluir fornecedor com produtos associados. Desative-o primeiro.' },
            { status: 400 }
          )
        }

        // Marcar como inativo em vez de deletar
        const result = await pool.query(`
          UPDATE "Supplier" 
          SET "isActive" = false, "updatedAt" = NOW()
          WHERE id = $1
          RETURNING *
        `, [id])

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Fornecedor não encontrado' },
            { status: 404 }
          )
        }

        return NextResponse.json({ message: 'Fornecedor desativado com sucesso' })
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    // Verificar se há produtos associados
    const activeProducts = await prisma.productSupplier.count({
      where: {
        supplierId: id,
        isActive: true
      }
    })

    if (activeProducts > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir fornecedor com produtos associados. Desative-o primeiro.' },
        { status: 400 }
      )
    }

    // Marcar como inativo em vez de deletar
    await prisma.supplier.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Fornecedor desativado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar fornecedor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
        const result = await pool.query(`
          UPDATE "Supplier" 
          SET "isActive" = $2, "updatedAt" = NOW()
          WHERE id = $1
          RETURNING *
        `, [id, data.isActive])

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Fornecedor não encontrado' },
            { status: 404 }
          )
        }

        return NextResponse.json(result.rows[0])
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    const supplier = await prisma.supplier.update({
      where: { id },
      data: { isActive: data.isActive }
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Erro ao alterar status do fornecedor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}