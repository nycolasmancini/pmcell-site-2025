import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const icon = formData.get('icon') as string
    const order = formData.get('order') as string
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Em produção, usar conexão direta
    if (process.env.NODE_ENV === 'production') {
      const { Pool } = require('pg')
      const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
      
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      })

      try {
        // Check if category exists
        const existingResult = await pool.query('SELECT id, name, slug FROM "Category" WHERE id = $1', [id])
        
        if (existingResult.rows.length === 0) {
          return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }
        
        // Check if slug already exists for another category
        const slugResult = await pool.query('SELECT id FROM "Category" WHERE slug = $1 AND id != $2', [slug, id])
        
        if (slugResult.rows.length > 0) {
          return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 })
        }
        
        // Update category
        const updateResult = await pool.query(`
          UPDATE "Category" 
          SET name = $1, slug = $2, "order" = $3, icon = $4, "updatedAt" = NOW()
          WHERE id = $5 
          RETURNING id, name, slug, "order", icon, "isActive", "createdAt", "updatedAt"
        `, [name, slug, order ? parseInt(order) : 0, icon, id])
        
        const category = updateResult.rows[0]
        return NextResponse.json(category)
      } finally {
        await pool.end()
      }
    }
    
    // Em desenvolvimento, usar Prisma
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true }
    })
    
    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    // Check if slug already exists for another category
    if (existingCategory.slug !== slug) {
      const slugExists = await prisma.category.findFirst({
        where: { 
          slug,
          id: { not: id }
        },
        select: { id: true }
      })
      
      if (slugExists) {
        return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 })
      }
    }
    
    // Update category without icon field until schema is updated
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        order: order ? parseInt(order) : 0
      },
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
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { order } = body
    
    if (order === undefined || order === null) {
      return NextResponse.json({ error: 'Order is required' }, { status: 400 })
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
        // Check if category exists
        const existingResult = await pool.query('SELECT id FROM "Category" WHERE id = $1', [id])
        
        if (existingResult.rows.length === 0) {
          return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }
        
        // Update only the order
        const updateResult = await pool.query(`
          UPDATE "Category" 
          SET "order" = $1, "updatedAt" = NOW()
          WHERE id = $2 
          RETURNING id, name, slug, "order", icon, "isActive", "createdAt", "updatedAt"
        `, [parseInt(order), id])
        
        const category = updateResult.rows[0]
        return NextResponse.json(category)
      } finally {
        await pool.end()
      }
    }
    
    // Em desenvolvimento, usar Prisma
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: { id: true }
    })
    
    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    // Update only the order
    const category = await prisma.category.update({
      where: { id },
      data: { order: parseInt(order) },
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
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category order:', error)
    return NextResponse.json({ error: 'Failed to update category order' }, { status: 500 })
  }
}