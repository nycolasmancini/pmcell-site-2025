import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { query as dbQuery, testConnection } from '@/lib/db'
import { productsCache, getCacheKey } from '@/lib/cache'

// Função para gerar ETag baseado nos parâmetros
function generateETag(params: Record<string, any>): string {
  const paramsString = JSON.stringify(params, Object.keys(params).sort())
  return Buffer.from(paramsString).toString('base64').slice(0, 16)
}

// Versão otimizada da API de produtos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const admin = searchParams.get('admin')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const includeImages = searchParams.get('includeImages') === 'true'

    // Gerar chave de cache e ETag
    const cacheKey = getCacheKey('products', categoryId || 'all', featured || 'all', search || 'none', admin || 'public', page, limit, includeImages ? 'with-images' : 'no-images')
    const etag = generateETag({ categoryId, featured, search, admin, page, limit, includeImages })

    // Verificar se o cliente já tem a versão mais recente (304 Not Modified)
    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { 
        status: 304,
        headers: {
          'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
          'ETag': etag
        }
      })
    }

    // Verificar cache em memória primeiro
    const cached = productsCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
          'ETag': etag,
          'X-Cache': 'HIT'
        }
      })
    }

    // Determinar qual método usar
    const useProduction = process.env.NODE_ENV === 'production'
    let products: any[]
    let total: number

    if (useProduction) {
      const result = await getProductsProduction(categoryId, featured, search, admin, page, limit, includeImages)
      products = result.products
      total = result.total
    } else {
      const result = await getProductsDevelopment(categoryId, featured, search, admin, page, limit, includeImages)
      products = result.products
      total = result.total
    }

    // Otimizar dados de resposta
    const optimizedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      subname: product.subname,
      description: product.description,
      brand: product.brand,
      price: parseFloat(product.price || 0),
      superWholesalePrice: product.superWholesalePrice ? parseFloat(product.superWholesalePrice) : null,
      superWholesaleQuantity: product.superWholesaleQuantity || null,
      categoryId: product.categoryId,
      featured: product.featured || false,
      isModalProduct: product.isModalProduct || false,
      isActive: product.isActive,
      // Só incluir imagens se solicitado, e apenas metadados essenciais
      images: includeImages ? (product.images || []).map((img: any) => ({
        id: img.id,
        isMain: img.isMain,
        order: img.order,
        // URL para endpoint separado de imagens ao invés de base64
        thumbnailUrl: `/api/images/${img.id}/thumbnail`,
        fullUrl: `/api/images/${img.id}/full`
      })) : [],
      // Simplificar modelos
      models: (product.models || []).slice(0, 5).map((model: any) => ({
        id: model.id,
        brandName: model.brandName,
        modelName: model.modelName,
        price: model.price
      })),
      hasModels: (product.models || []).length > 0,
      priceRange: product.priceRange || null
    }))

    const response = {
      products: optimizedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }

    // Cachear resultado por 30 minutos
    productsCache.set(cacheKey, response, 1000 * 60 * 30)

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
        'ETag': etag,
        'X-Cache': 'MISS'
      }
    })

  } catch (error) {
    console.error('Error in optimized products API:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      products: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
    }, { status: 500 })
  }
}

// Versão otimizada para produção
async function getProductsProduction(
  categoryId: string | null, 
  featured: string | null, 
  search: string | null, 
  admin: string | null, 
  page: number, 
  limit: number, 
  includeImages: boolean
) {
  const isConnected = await testConnection()
  if (!isConnected) {
    throw new Error('Database connection failed')
  }

  const offset = (page - 1) * limit
  let whereConditions = []
  let queryParams = []

  if (admin !== 'true') {
    whereConditions.push('p."isActive" = true')
  }

  if (categoryId) {
    whereConditions.push('p."categoryId" = $' + (queryParams.length + 1))
    queryParams.push(categoryId)
  }

  if (featured === 'true') {
    whereConditions.push('p."featured" = $' + (queryParams.length + 1))
    queryParams.push(true)
  }

  if (search) {
    const searchParam = queryParams.length + 1
    whereConditions.push(`(p."name" ILIKE $${searchParam} OR p."description" ILIKE $${searchParam})`)
    queryParams.push(`%${search}%`)
  }

  const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''
  queryParams.push(limit, offset)

  // Query otimizada - só buscar imagens se necessário
  const imagesQuery = includeImages ? `
    COALESCE(
      JSON_AGG(
        CASE WHEN i.id IS NOT NULL THEN
          JSON_BUILD_OBJECT(
            'id', i.id,
            'order', i."order",
            'isMain', i."isMain"
          )
        END ORDER BY i."order", i.id
      ) FILTER (WHERE i.id IS NOT NULL),
      '[]'::json
    ) as images,
  ` : `'[]'::json as images,`

  const productsQuery = `
    SELECT 
      p.id, p.name, p.subname, p.description, p.brand, p.price, 
      p."superWholesalePrice", p."superWholesaleQuantity",
      p."categoryId", p.featured, p."isModalProduct", p."isActive",
      ${imagesQuery}
      COALESCE(
        JSON_AGG(
          CASE WHEN pm.id IS NOT NULL THEN
            JSON_BUILD_OBJECT(
              'id', m.id,
              'brandName', b.name,
              'modelName', m.name,
              'price', pm.price
            )
          END ORDER BY m.id
        ) FILTER (WHERE pm.id IS NOT NULL),
        '[]'::json
      ) as models
    FROM "Product" p
    ${includeImages ? 'LEFT JOIN "ProductImage" i ON i."productId" = p.id' : ''}
    LEFT JOIN "ProductModel" pm ON pm."productId" = p.id
    LEFT JOIN "Model" m ON m.id = pm."modelId"
    LEFT JOIN "Brand" b ON b.id = m."brandId"
    ${whereClause}
    GROUP BY p.id
    ORDER BY p."createdAt" DESC
    LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
  `

  const countQuery = `SELECT COUNT(*) as total FROM "Product" p ${whereClause}`
  const countParams = queryParams.slice(0, -2)

  const [productsResult, totalResult] = await Promise.all([
    dbQuery(productsQuery, queryParams),
    dbQuery(countQuery, countParams)
  ])

  if (!productsResult || !productsResult.rows) {
    throw new Error('Failed to fetch products from database')
  }

  if (!totalResult || !totalResult.rows || totalResult.rows.length === 0) {
    throw new Error('Failed to fetch products count from database')
  }

  const products = productsResult.rows.map((row: any) => ({
    ...row,
    models: Array.isArray(row.models) ? row.models : [],
    images: Array.isArray(row.images) ? row.images : []
  }))

  return {
    products,
    total: parseInt(totalResult.rows[0].total)
  }
}

// Versão otimizada para desenvolvimento
async function getProductsDevelopment(
  categoryId: string | null, 
  featured: string | null, 
  search: string | null, 
  admin: string | null, 
  page: number, 
  limit: number, 
  includeImages: boolean
) {
  const skip = (page - 1) * limit
  const where: any = {}

  if (admin !== 'true') {
    where.isActive = true
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (featured === 'true') {
    where.featured = true
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        subname: true,
        description: true,
        brand: true,
        price: true,
        superWholesalePrice: true,
        superWholesaleQuantity: true,
        categoryId: true,
        featured: true,
        isModalProduct: true,
        isActive: true,
        // Só incluir imagens se solicitado, e apenas metadados
        images: includeImages ? {
          select: {
            id: true,
            isMain: true,
            order: true
          },
          orderBy: { order: 'asc' }
        } : false,
        // Limitar modelos para evitar payloads grandes
        models: {
          take: 5,
          select: {
            id: true,
            price: true,
            model: {
              select: {
                id: true,
                name: true,
                brand: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where })
  ])

  return { products, total }
}