import { Pool } from 'pg'

let pool: Pool | null = null

export function getPool() {
  if (!pool) {
    const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
    
    if (!databaseUrl) {
      throw new Error('Database URL not configured')
    }
    
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : undefined,
      max: 3, // Reduzir máximo de conexões para evitar overload
      idleTimeoutMillis: 30000, // 30 segundos - aumentar tempo de idle
      connectionTimeoutMillis: 10000, // 10 segundos - mais tempo para conectar
      statement_timeout: 20000, // 20 segundos timeout para queries
      query_timeout: 20000,
      application_name: 'pmcell-vendas',
      keepAlive: true,
      keepAliveInitialDelayMillis: 30000, // Iniciar keepalive após 30s
      // Configurações adicionais para estabilidade
      allowExitOnIdle: false // Não permitir que o pool termine quando idle
    })
    
    // Log de eventos do pool para debug
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
    
    pool.on('connect', () => {
      console.log('New client connected to database')
    })
    
    pool.on('remove', () => {
      console.log('Client removed from pool')
    })
  }
  
  return pool
}

export async function query(text: string, params?: any[], retries = 2) {
  const start = Date.now()
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const currentPool = getPool() // Obter pool a cada tentativa
      const result = await currentPool.query(text, params)
      const duration = Date.now() - start
      console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount })
      return result
    } catch (error: any) {
      const duration = Date.now() - start
      console.error(`Database query error (attempt ${attempt + 1}/${retries + 1}):`, error)
      
      // Se for erro de conexão e ainda temos tentativas, retry
      if ((error.code === 'XX000' || error.message?.includes('shutdown') || error.message?.includes('termination')) && attempt < retries) {
        console.log(`Retrying query in 1 second... (attempt ${attempt + 2}/${retries + 1})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Resetar pool para forçar nova conexão
        if (pool) {
          try { 
            await pool.end() 
            console.log('Pool connection closed for reset')
          } catch (endError) {
            console.log('Error closing pool:', endError)
          }
          pool = null
        }
        continue
      }
      
      // Se não conseguimos após todas as tentativas, lançar erro
      throw error
    }
  }
}

// Função para testar a conexão
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()')
    if (!result || !result.rows) {
      throw new Error('No result returned from database test query')
    }
    console.log('Database connection test successful:', result.rows[0])
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

// Função para criar produto via SQL direto
export async function createProduct(productData: {
  name: string
  subname?: string | null
  description?: string | null
  brand?: string | null
  price: number
  superWholesalePrice?: number | null
  superWholesaleQuantity?: number | null
  cost?: number | null
  categoryId: string
  isModalProduct?: boolean
  quickAddIncrement?: number | null
}) {
  const {
    name,
    subname,
    description,
    brand,
    price,
    superWholesalePrice,
    superWholesaleQuantity,
    cost,
    categoryId,
    isModalProduct = false,
    quickAddIncrement
  } = productData

  // Gerar ID único
  const productId = `cm${Math.random().toString(36).substring(2, 15)}`
  
  const insertQuery = `
    INSERT INTO "Product" (
      "id", "name", "subname", "description", "brand", "price", 
      "superWholesalePrice", "superWholesaleQuantity", "cost", 
      "categoryId", "isModalProduct", "quickAddIncrement",
      "isActive", "featured", "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
    ) RETURNING *
  `
  
  const now = new Date()
  const params = [
    productId,
    name,
    subname,
    description,
    brand,
    price,
    superWholesalePrice,
    superWholesaleQuantity,
    cost,
    categoryId,
    isModalProduct,
    quickAddIncrement,
    true, // isActive
    false, // featured
    now, // createdAt
    now // updatedAt
  ]
  
  const result = await query(insertQuery, params)
  if (!result || !result.rows || result.rows.length === 0) {
    throw new Error('Failed to create product - no result returned')
  }
  return result.rows[0]
}

// Função para criar imagem de produto via SQL direto
export async function createProductImage(imageData: {
  productId: string
  url: string
  fileName?: string | null
  cloudinaryId?: string
  order: number
  isMain: boolean
}) {
  const { productId, url, fileName, cloudinaryId, order, isMain } = imageData
  
  // Gerar ID único
  const imageId = `cm${Math.random().toString(36).substring(2, 15)}`
  
  const insertQuery = `
    INSERT INTO "ProductImage" (
      "id", "productId", "url", "fileName", "cloudinaryId", "order", "isMain", "createdAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8
    ) RETURNING *
  `
  
  const params = [
    imageId,
    productId,
    url,
    fileName,
    cloudinaryId,
    order,
    isMain,
    new Date()
  ]
  
  const result = await query(insertQuery, params)
  if (!result || !result.rows || result.rows.length === 0) {
    throw new Error('Failed to create product image - no result returned')
  }
  return result.rows[0]
}

// Função para encontrar ou criar marca via SQL direto
export async function findOrCreateBrand(name: string) {
  // Primeiro tentar encontrar
  const findQuery = 'SELECT * FROM "Brand" WHERE "name" = $1'
  const findResult = await query(findQuery, [name])
  
  if (findResult && findResult.rows && findResult.rows.length > 0) {
    return findResult.rows[0]
  }
  
  // Se não encontrou, criar
  const brandId = `cm${Math.random().toString(36).substring(2, 15)}`
  const insertQuery = `
    INSERT INTO "Brand" ("id", "name", "order", "createdAt") 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `
  const params = [brandId, name, 0, new Date()]
  const result = await query(insertQuery, params)
  if (!result || !result.rows || result.rows.length === 0) {
    throw new Error('Failed to create brand - no result returned')
  }
  return result.rows[0]
}

// Função para encontrar ou criar modelo via SQL direto
export async function findOrCreateModel(name: string, brandId: string) {
  // Primeiro tentar encontrar
  const findQuery = 'SELECT * FROM "Model" WHERE "name" = $1 AND "brandId" = $2'
  const findResult = await query(findQuery, [name, brandId])
  
  if (findResult && findResult.rows && findResult.rows.length > 0) {
    return findResult.rows[0]
  }
  
  // Se não encontrou, criar
  const modelId = `cm${Math.random().toString(36).substring(2, 15)}`
  const insertQuery = `
    INSERT INTO "Model" ("id", "name", "brandId", "createdAt") 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `
  const params = [modelId, name, brandId, new Date()]
  const result = await query(insertQuery, params)
  if (!result || !result.rows || result.rows.length === 0) {
    throw new Error('Failed to create model - no result returned')
  }
  return result.rows[0]
}

// Função para criar ProductModel via SQL direto
export async function createProductModel(data: {
  productId: string
  modelId: string
  price?: number | null
  superWholesalePrice?: number | null
}) {
  const { productId, modelId, price, superWholesalePrice } = data
  
  const productModelId = `cm${Math.random().toString(36).substring(2, 15)}`
  const insertQuery = `
    INSERT INTO "ProductModel" ("id", "productId", "modelId", "price", "superWholesalePrice", "createdAt") 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *
  `
  const params = [productModelId, productId, modelId, price, superWholesalePrice, new Date()]
  const result = await query(insertQuery, params)
  if (!result || !result.rows || result.rows.length === 0) {
    throw new Error('Failed to create product model - no result returned')
  }
  return result.rows[0]
}

// Função para atualizar produto via SQL direto
export async function updateProduct(productId: string, data: {
  price?: number
  superWholesalePrice?: number | null
  superWholesaleQuantity?: number | null
}) {
  const { price, superWholesalePrice, superWholesaleQuantity } = data
  
  let setParts = []
  let params = []
  let paramIndex = 1
  
  if (price !== undefined) {
    setParts.push(`"price" = $${paramIndex}`)
    params.push(price)
    paramIndex++
  }
  
  if (superWholesalePrice !== undefined) {
    setParts.push(`"superWholesalePrice" = $${paramIndex}`)
    params.push(superWholesalePrice)
    paramIndex++
  }
  
  if (superWholesaleQuantity !== undefined) {
    setParts.push(`"superWholesaleQuantity" = $${paramIndex}`)
    params.push(superWholesaleQuantity)
    paramIndex++
  }
  
  setParts.push(`"updatedAt" = $${paramIndex}`)
  params.push(new Date())
  paramIndex++
  
  params.push(productId)
  
  const updateQuery = `
    UPDATE "Product" 
    SET ${setParts.join(', ')} 
    WHERE "id" = $${paramIndex} 
    RETURNING *
  `
  
  const result = await query(updateQuery, params)
  if (!result || !result.rows || result.rows.length === 0) {
    throw new Error('Failed to update product model - no result returned')
  }
  return result.rows[0]
}

/**
 * Criar produto com imagens via SQL direto (fallback para Prisma)
 */
export async function createProductWithImages(
  productData: {
    name: string
    subname?: string | null
    description?: string | null
    brand?: string | null
    price: number
    specialPrice?: number | null
    specialQuantity?: number | null
    superWholesalePrice?: number | null
    superWholesaleQuantity?: number | null
    cost?: number | null
    boxQuantity?: number | null
    categoryId: string
    isActive?: boolean
    featured?: boolean
    isModalProduct?: boolean
    quickAddIncrement?: number | null
  },
  temporaryImages: Array<{
    url: string
    fileName?: string
    order: number
    isMain: boolean
  }>
): Promise<{ product: any; images: any[] }> {
  const client = getPool()
  const dbClient = await client.connect()
  
  try {
    // Iniciar transação
    await dbClient.query('BEGIN')
    
    // Verificar se categoria existe
    const categoryCheck = await dbClient.query(
      'SELECT id FROM "Category" WHERE id = $1',
      [productData.categoryId]
    )
    
    if (!categoryCheck.rows || categoryCheck.rows.length === 0) {
      throw new Error('Categoria não encontrada')
    }
    
    // Criar produto
    const productId = `cm${Math.random().toString(36).substring(2, 15)}${Date.now()}`
    const now = new Date()
    
    const productResult = await dbClient.query(`
      INSERT INTO "Product" (
        "id", "name", "subname", "description", "brand", "price", 
        "specialPrice", "specialQuantity", "superWholesalePrice", "superWholesaleQuantity", 
        "cost", "boxQuantity", "categoryId", "isActive", "featured", 
        "isModalProduct", "quickAddIncrement", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING *
    `, [
      productId,
      productData.name,
      productData.subname,
      productData.description,
      productData.brand,
      productData.price,
      productData.specialPrice,
      productData.specialQuantity,
      productData.superWholesalePrice,
      productData.superWholesaleQuantity,
      productData.cost,
      productData.boxQuantity,
      productData.categoryId,
      productData.isActive !== false,
      productData.featured || false,
      productData.isModalProduct || false,
      productData.quickAddIncrement,
      now,
      now
    ])
    
    if (!productResult.rows || productResult.rows.length === 0) {
      throw new Error('Falha ao criar produto')
    }
    
    const product = productResult.rows[0]
    console.log('✅ Produto criado via SQL:', product.id)
    
    // Criar imagens
    const images = []
    for (const [index, imageData] of temporaryImages.entries()) {
      const imageId = `cm${Math.random().toString(36).substring(2, 15)}${Date.now()}`
      
      const imageResult = await dbClient.query(`
        INSERT INTO "ProductImage" (
          "id", "productId", "url", "fileName", "order", "isMain", "createdAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        ) RETURNING *
      `, [
        imageId,
        product.id,
        imageData.url,
        imageData.fileName,
        imageData.order !== undefined ? imageData.order : index,
        imageData.isMain !== undefined ? imageData.isMain : index === 0,
        now
      ])
      
      if (imageResult.rows && imageResult.rows.length > 0) {
        images.push(imageResult.rows[0])
      }
    }
    
    // Commit da transação
    await dbClient.query('COMMIT')
    
    console.log(`✅ Produto criado via SQL com ${images.length} imagens`)
    
    return { product, images }
    
  } catch (error) {
    // Rollback em caso de erro
    await dbClient.query('ROLLBACK')
    console.error('❌ Erro na criação via SQL:', error)
    throw error
  } finally {
    dbClient.release()
  }
}

/**
 * Verificar se categoria existe via SQL direto
 */
export async function checkCategoryExists(categoryId: string): Promise<boolean> {
  try {
    const result = await query('SELECT id FROM "Category" WHERE id = $1', [categoryId])
    return !!(result?.rows && result.rows.length > 0)
  } catch (error) {
    console.error('❌ Erro ao verificar categoria via SQL:', error)
    return false
  }
}