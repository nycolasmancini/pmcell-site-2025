import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

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
          SELECT c.*, COUNT(p.id) as product_count 
          FROM "Category" c 
          LEFT JOIN "Product" p ON p."categoryId" = c.id 
          WHERE c."isActive" = true 
          GROUP BY c.id 
          ORDER BY c."order" ASC
        `)
        
        const categories = result.rows.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          order: cat.order,
          isActive: cat.isActive,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
          icon: cat.icon,
          _count: { products: parseInt(cat.product_count) }
        }))

        // Temporariamente, adicionar ícones de teste para demonstração
        const categoriesWithIcons = categories.map((cat: any) => {
          if (cat.name === 'Teste Estrela') {
            return {
              ...cat,
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
            }
          }
          if (cat.name === 'Capas') {
            return {
              ...cat,
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1 17 1H7Z"/></svg>'
            }
          }
          if (cat.name === 'Cilindro') {
            return {
              ...cat,
              icon: '<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M12 2C20 2 20 5 20 5C20 5 20 8 12 8C4 8 4 5 4 5C4 5 4 2 12 2Z" stroke="currentColor" stroke-width="1.5"></path><path d="M12 16C20 16 20 19 20 19C20 19 20 22 12 22C4 22 4 19 4 19C4 19 4 16 12 16Z" stroke="currentColor" stroke-width="1.5"></path><path d="M20 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
            }
          }
          return cat
        })

        return NextResponse.json(categoriesWithIcons)
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    let categories
    try {
      categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          order: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          icon: true,
          _count: {
            select: { products: true }
          }
        }
      })
    } catch (iconError) {
      // Fallback to query without icon field if it doesn't exist
      console.log('Icon field not available, using fallback query')
      categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          order: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { products: true }
          }
        }
      })
    }
    
    // Temporariamente, adicionar ícones de teste para demonstração
    const categoriesWithIcons = categories.map((cat: any) => {
      if (cat.name === 'Teste Estrela') {
        return {
          ...cat,
          icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
        }
      }
      if (cat.name === 'Capas') {
        return {
          ...cat,
          icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1 17 1H7Z"/></svg>'
        }
      }
      if (cat.name === 'Cilindro') {
        return {
          ...cat,
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M12 2C20 2 20 5 20 5C20 5 20 8 12 8C4 8 4 5 4 5C4 5 4 2 12 2Z" stroke="currentColor" stroke-width="1.5"></path><path d="M12 16C20 16 20 19 20 19C20 19 20 22 12 22C4 22 4 19 4 19C4 19 4 16 12 16Z" stroke="currentColor" stroke-width="1.5"></path><path d="M20 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
        }
      }
      return cat
    })
    
    return NextResponse.json(categoriesWithIcons)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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
        // Check if slug already exists
        const existingResult = await pool.query('SELECT id, name, slug FROM "Category" WHERE slug = $1', [slug])
        
        if (existingResult.rows.length > 0) {
          return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 })
        }
        
        // Generate unique ID
        const categoryId = nanoid()
        
        // Create category
        const insertResult = await pool.query(`
          INSERT INTO "Category" (id, name, slug, "order", icon, "isActive", "createdAt", "updatedAt") 
          VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW()) 
          RETURNING id, name, slug, "order", icon, "isActive", "createdAt", "updatedAt"
        `, [categoryId, name, slug, order ? parseInt(order) : 0, icon])
        
        const category = insertResult.rows[0]
        return NextResponse.json(category, { status: 201 })
      } finally {
        await pool.end()
      }
    }
    
    // Em desenvolvimento, usar Prisma
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })
    
    if (existingCategory) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 })
    }
    
    // For now, create category without icon field until schema is updated
    const category = await prisma.category.create({
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
    
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
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
        // Check if category exists and count products
        const categoryResult = await pool.query(`
          SELECT c.id, c.name, COUNT(p.id) as product_count
          FROM "Category" c 
          LEFT JOIN "Product" p ON p."categoryId" = c.id 
          WHERE c.id = $1 
          GROUP BY c.id, c.name
        `, [id])
        
        if (categoryResult.rows.length === 0) {
          return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }
        
        const category = categoryResult.rows[0]
        const productCount = parseInt(category.product_count)
        
        if (productCount > 0) {
          return NextResponse.json({ 
            error: `Cannot delete category. It has ${productCount} product(s) associated.` 
          }, { status: 400 })
        }
        
        // Delete the category
        await pool.query('DELETE FROM "Category" WHERE id = $1', [id])
        
        return NextResponse.json({ message: 'Category deleted successfully' })
      } finally {
        await pool.end()
      }
    }
    
    // Em desenvolvimento, usar Prisma
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: {
          select: { products: true }
        }
      }
    })
    
    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json({ 
        error: `Cannot delete category. It has ${existingCategory._count.products} product(s) associated.` 
      }, { status: 400 })
    }
    
    // Delete the category using raw query to avoid icon field issues
    await prisma.$executeRaw`DELETE FROM "Category" WHERE id = ${id}`
    
    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}