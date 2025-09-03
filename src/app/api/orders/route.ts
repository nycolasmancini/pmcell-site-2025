import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateOrderNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${year}${month}${day}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, items, notes } = body

    // Validar WhatsApp brasileiro
    const whatsappRegex = /^55\d{10,11}$/
    const cleanWhatsapp = customer.whatsapp.replace(/\D/g, '')
    
    if (!whatsappRegex.test(cleanWhatsapp)) {
      return NextResponse.json(
        { error: 'WhatsApp inválido. Use o formato brasileiro com DDD.' },
        { status: 400 }
      )
    }

    // Em produção, usar conexão direta
    if (process.env.NODE_ENV === 'production') {
      const { Pool } = require('pg')
      const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
      
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      })

      try {
        // Buscar ou criar cliente
        let customerResult = await pool.query(
          'SELECT * FROM "Customer" WHERE whatsapp = $1',
          [cleanWhatsapp]
        )
        let dbCustomer = customerResult.rows[0]

        if (!dbCustomer) {
          // Criar cliente
          const createResult = await pool.query(`
            INSERT INTO "Customer" (id, name, whatsapp, email, company, cnpj, "firstAccess", "lastAccess", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW(), NOW(), NOW())
            RETURNING *
          `, [customer.name, cleanWhatsapp, customer.email || null, customer.company || null, customer.cnpj || null])
          dbCustomer = createResult.rows[0]
        } else {
          // Atualizar última atividade
          await pool.query(
            'UPDATE "Customer" SET "lastAccess" = NOW() WHERE id = $1',
            [dbCustomer.id]
          )
        }

        // Calcular totais
        let subtotal = 0
        const orderItems = []

        for (const item of items) {
          // Buscar produto
          const productResult = await pool.query(
            'SELECT * FROM "Product" WHERE id = $1 AND "isActive" = true',
            [item.productId]
          )
          const product = productResult.rows[0]

          if (!product) {
            return NextResponse.json(
              { error: `Produto ${item.productId} não encontrado ou indisponível` },
              { status: 400 }
            )
          }

          // Determinar preço baseado no modelo (se houver) ou no produto
          let unitPrice = parseFloat(product.price || 0)
          let superWholesalePrice = parseFloat(product.superWholesalePrice || 0)
          let superWholesaleQuantity = parseInt(product.superWholesaleQuantity || 0)
          
          if (item.modelId) {
            // Se tem modelId, buscar o preço específico do modelo
            const modelResult = await pool.query(`
              SELECT * FROM "ProductModel" 
              WHERE "productId" = $1 AND "modelId" = $2
            `, [item.productId, item.modelId])
            const productModel = modelResult.rows[0]
            
            if (productModel && productModel.price) {
              unitPrice = parseFloat(productModel.price)
              superWholesalePrice = parseFloat(productModel.superWholesalePrice || 0)
              superWholesaleQuantity = parseInt(product.quickAddIncrement || 0)
            }
          }

          // Aplicar preço especial (1º nível de desconto)
          if (product.specialQuantity && item.quantity >= parseInt(product.specialQuantity) && product.specialPrice) {
            unitPrice = parseFloat(product.specialPrice)
          }

          // Aplicar preço super atacado (2º nível de desconto - maior desconto)
          if (superWholesaleQuantity && item.quantity >= superWholesaleQuantity && superWholesalePrice) {
            unitPrice = superWholesalePrice
          }

          const totalPrice = unitPrice * item.quantity
          subtotal += totalPrice

          orderItems.push({
            productId: item.productId,
            productName: product.name,
            modelName: item.modelName || null,
            quantity: item.quantity,
            unitPrice,
            totalPrice
          })
        }

        // Criar pedido
        const orderNumber = generateOrderNumber()
        const orderResult = await pool.query(`
          INSERT INTO "Order" (id, "orderNumber", "customerId", subtotal, discount, total, status, notes, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          RETURNING *
        `, [orderNumber, dbCustomer.id, subtotal, 0, subtotal, 'PENDING', notes || null])
        const order = orderResult.rows[0]

        // Criar itens do pedido
        for (const orderItem of orderItems) {
          await pool.query(`
            INSERT INTO "OrderItem" (id, "orderId", "productId", "productName", "modelName", quantity, "unitPrice", "totalPrice", "createdAt")
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
          `, [order.id, orderItem.productId, orderItem.productName, orderItem.modelName, orderItem.quantity, orderItem.unitPrice, orderItem.totalPrice])
        }

        // Criar log do webhook para N8N processar
        await pool.query(`
          INSERT INTO "WebhookLog" (id, "eventType", "orderId", payload, success, "createdAt")
          VALUES (gen_random_uuid(), 'ORDER_CREATED', $1, $2, false, NOW())
        `, [order.id, JSON.stringify({ ...order, customer: dbCustomer, items: orderItems })])

        // Buscar pedido completo para retornar
        const completeOrderResult = await pool.query(`
          SELECT 
            o.*,
            row_to_json(c.*) as customer,
            COALESCE(
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', oi.id,
                  'productId', oi."productId",
                  'productName', oi."productName",
                  'modelName', oi."modelName",
                  'quantity', oi.quantity,
                  'unitPrice', oi."unitPrice",
                  'totalPrice', oi."totalPrice"
                )
              ), '[]'::json
            ) as items
          FROM "Order" o
          JOIN "Customer" c ON c.id = o."customerId"
          LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
          WHERE o.id = $1
          GROUP BY o.id, c.*
        `, [order.id])
        
        const completeOrder = completeOrderResult.rows[0]
        completeOrder.items = Array.isArray(completeOrder.items) ? completeOrder.items : []
        
        return NextResponse.json(completeOrder, { status: 201 })
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    // Buscar ou criar cliente
    let dbCustomer = await prisma.customer.findUnique({
      where: { whatsapp: cleanWhatsapp }
    })

    if (!dbCustomer) {
      dbCustomer = await prisma.customer.create({
        data: {
          name: customer.name,
          whatsapp: cleanWhatsapp,
          email: customer.email,
          company: customer.company,
          cnpj: customer.cnpj
        }
      })
    } else {
      // Atualizar última atividade
      await prisma.customer.update({
        where: { id: dbCustomer.id },
        data: { lastAccess: new Date() }
      })
    }

    // Calcular totais
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { 
          id: item.productId,
          isActive: true
        }
      })

      if (!product) {
        return NextResponse.json(
          { error: `Produto ${item.productId} não encontrado ou indisponível` },
          { status: 400 }
        )
      }

      // Determinar preço baseado no modelo (se houver) ou no produto
      let unitPrice = product.price
      let superWholesalePrice = product.superWholesalePrice
      let superWholesaleQuantity = product.superWholesaleQuantity
      
      if (item.modelId) {
        // Se tem modelId, buscar o preço específico do modelo
        const productModel = await prisma.productModel.findUnique({
          where: {
            productId_modelId: {
              productId: item.productId,
              modelId: item.modelId
            }
          }
        })
        
        if (productModel && productModel.price) {
          unitPrice = productModel.price
          superWholesalePrice = productModel.superWholesalePrice
          // Para produtos com modelo, usar quickAddIncrement como quantidade mínima
          superWholesaleQuantity = product.quickAddIncrement
        }
      }

      // Aplicar preço especial (1º nível de desconto)
      if (product.specialQuantity && item.quantity >= product.specialQuantity && product.specialPrice) {
        unitPrice = product.specialPrice
      }

      // Aplicar preço super atacado (2º nível de desconto - maior desconto)
      if (superWholesaleQuantity && item.quantity >= superWholesaleQuantity && superWholesalePrice) {
        unitPrice = superWholesalePrice
      }

      const totalPrice = unitPrice * item.quantity
      subtotal += totalPrice

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        modelName: item.modelName,
        quantity: item.quantity,
        unitPrice,
        totalPrice
      })
    }

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: dbCustomer.id,
        subtotal,
        total: subtotal,
        notes,
        items: {
          create: orderItems
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Criar log do webhook para N8N processar
    await prisma.webhookLog.create({
      data: {
        eventType: 'ORDER_CREATED',
        orderId: order.id,
        payload: order as any,
        success: false
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Em produção, usar conexão direta
    if (process.env.NODE_ENV === 'production') {
      const { Pool } = require('pg')
      const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
      
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      })

      try {
        let whereConditions = []
        let queryParams = []

        if (status) {
          whereConditions.push('o.status = $' + (queryParams.length + 1))
          queryParams.push(status)
        }

        if (customerId) {
          whereConditions.push('o."customerId" = $' + (queryParams.length + 1))
          queryParams.push(customerId)
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

        // Adicionar limit e offset aos parâmetros
        queryParams.push(limit, offset)

        // Query para buscar pedidos com cliente e itens
        const ordersQuery = `
          SELECT 
            o.*,
            row_to_json(c.*) as customer,
            COALESCE(
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', oi.id,
                  'productId', oi."productId",
                  'productName', oi."productName",
                  'modelName', oi."modelName",
                  'quantity', oi.quantity,
                  'unitPrice', oi."unitPrice",
                  'totalPrice', oi."totalPrice"
                ) ORDER BY oi."createdAt"
              ) FILTER (WHERE oi.id IS NOT NULL),
              '[]'::json
            ) as items
          FROM "Order" o
          JOIN "Customer" c ON c.id = o."customerId"
          LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
          ${whereClause}
          GROUP BY o.id, c.*
          ORDER BY o."createdAt" DESC
          LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
        `

        // Query para contar total
        const countQuery = `
          SELECT COUNT(*) as total
          FROM "Order" o
          ${whereClause}
        `
        const countParams = queryParams.slice(0, -2) // Remove limit e offset

        const [ordersResult, totalResult] = await Promise.all([
          pool.query(ordersQuery, queryParams),
          pool.query(countQuery, countParams)
        ])

        const orders = ordersResult.rows.map((row: any) => ({
          id: row.id,
          orderNumber: row.orderNumber,
          customerId: row.customerId,
          subtotal: parseFloat(row.subtotal || 0),
          total: parseFloat(row.total || 0),
          notes: row.notes,
          status: row.status || 'pending',
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          customer: row.customer,
          items: Array.isArray(row.items) ? row.items : []
        }))

        const total = parseInt(totalResult.rows[0].total)

        return NextResponse.json({
          orders,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        })
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (customerId) {
      where.customerId = customerId
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}