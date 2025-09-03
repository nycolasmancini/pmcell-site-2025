import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AnalyticsPayload {
  sessionId: string
  whatsapp?: string
  startTime?: number
  lastActivity?: number
  timeOnSite?: number
  whatsappCollectedAt?: number
  categoriesVisited?: Array<{
    name: string
    visits: number
    lastVisit: number
    categoryId?: string
  }>
  searchTerms?: Array<{
    term: string
    count: number
    lastSearch: number
  }>
  productsViewed?: Array<{
    id: string
    name: string
    category: string
    visits: number
    lastView: number
  }>
  cartEvents?: Array<{
    type: 'add' | 'remove' | 'update' | 'clear' | 'complete' | 'abandon'
    productId: string
    productName?: string
    quantity: number
    unitPrice?: number
    totalPrice?: number
    timestamp: number
  }>
  pageViews?: Array<{
    path: string
    title?: string
    duration?: number
    timestamp: number
  }>
}

// Rate limiting simples
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 60 // 60 requests por minuto por sessão

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now()
  const clientData = rateLimitMap.get(sessionId)

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(sessionId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  clientData.count++
  rateLimitMap.set(sessionId, clientData)
  return true
}

export async function POST(request: NextRequest) {
  try {
    const data: AnalyticsPayload = await request.json()
    
    if (!data.sessionId) {
      return NextResponse.json(
        { error: 'sessionId é obrigatório' },
        { status: 400 }
      )
    }

    // Rate limiting
    if (!checkRateLimit(data.sessionId)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns segundos.' },
        { status: 429 }
      )
    }

    console.log('📊 Analytics Save: Recebendo dados para sessionId:', data.sessionId)

    // Upsert da sessão principal
    const session = await prisma.analyticsSession.upsert({
      where: { sessionId: data.sessionId },
      update: {
        whatsapp: data.whatsapp || undefined,
        lastActivity: data.lastActivity ? new Date(data.lastActivity) : new Date(),
        timeOnSite: data.timeOnSite || 0,
        whatsappCollectedAt: data.whatsappCollectedAt ? new Date(data.whatsappCollectedAt) : undefined,
        updatedAt: new Date()
      },
      create: {
        sessionId: data.sessionId,
        whatsapp: data.whatsapp || null,
        startTime: data.startTime ? new Date(data.startTime) : new Date(),
        lastActivity: data.lastActivity ? new Date(data.lastActivity) : new Date(),
        timeOnSite: data.timeOnSite || 0,
        whatsappCollectedAt: data.whatsappCollectedAt ? new Date(data.whatsappCollectedAt) : null,
        isActive: true
      }
    })

    // Salvar visualizações de páginas
    if (data.pageViews && data.pageViews.length > 0) {
      for (const pageView of data.pageViews) {
        await prisma.pageView.create({
          data: {
            sessionId: data.sessionId,
            path: pageView.path,
            title: pageView.title || null,
            duration: pageView.duration || null,
            timestamp: new Date(pageView.timestamp)
          }
        })
      }
    }

    // Salvar visitas de categorias
    if (data.categoriesVisited && data.categoriesVisited.length > 0) {
      for (const category of data.categoriesVisited) {
        // Verificar se categoria tem itens no carrinho
        const hasCartItems = data.cartEvents?.some(event => 
          event.type === 'add' && 
          data.productsViewed?.some(product => 
            product.id === event.productId && 
            product.category === category.name
          )
        ) || false

        await prisma.categoryVisit.upsert({
          where: {
            sessionId_categoryId: {
              sessionId: data.sessionId,
              categoryId: category.categoryId || category.name
            }
          },
          update: {
            visits: category.visits,
            lastVisit: new Date(category.lastVisit),
            hasCartItems
          },
          create: {
            sessionId: data.sessionId,
            categoryId: category.categoryId || category.name,
            categoryName: category.name,
            visits: category.visits,
            lastVisit: new Date(category.lastVisit),
            hasCartItems
          }
        })
      }
    }

    // Salvar visualizações de produtos
    if (data.productsViewed && data.productsViewed.length > 0) {
      for (const product of data.productsViewed) {
        // Verificar se produto foi adicionado ao carrinho
        const addedToCart = data.cartEvents?.some(event => 
          event.type === 'add' && event.productId === product.id
        ) || false

        await prisma.productView.upsert({
          where: {
            sessionId_productId: {
              sessionId: data.sessionId,
              productId: product.id
            }
          },
          update: {
            visits: product.visits,
            lastView: new Date(product.lastView),
            addedToCart
          },
          create: {
            sessionId: data.sessionId,
            productId: product.id,
            productName: product.name,
            categoryName: product.category,
            visits: product.visits,
            lastView: new Date(product.lastView),
            addedToCart
          }
        })
      }
    }

    // Salvar histórico de pesquisas
    if (data.searchTerms && data.searchTerms.length > 0) {
      for (const search of data.searchTerms) {
        await prisma.searchHistory.upsert({
          where: {
            sessionId_term: {
              sessionId: data.sessionId,
              term: search.term
            }
          },
          update: {
            count: search.count,
            lastSearch: new Date(search.lastSearch)
          },
          create: {
            sessionId: data.sessionId,
            term: search.term,
            count: search.count,
            lastSearch: new Date(search.lastSearch)
          }
        })
      }
    }

    // Salvar eventos do carrinho
    if (data.cartEvents && data.cartEvents.length > 0) {
      // Para evitar duplicatas, vamos salvar apenas os eventos mais recentes que ainda não existem
      const existingEvents = await prisma.cartEvent.findMany({
        where: { sessionId: data.sessionId },
        orderBy: { timestamp: 'desc' },
        take: 10
      })

      const existingTimestamps = new Set(existingEvents.map(e => e.timestamp.getTime()))

      for (const event of data.cartEvents) {
        const eventTimestamp = new Date(event.timestamp)
        
        // Só adicionar se não existe evento com o mesmo timestamp
        if (!existingTimestamps.has(eventTimestamp.getTime())) {
          await prisma.cartEvent.create({
            data: {
              sessionId: data.sessionId,
              type: event.type.toUpperCase() as any,
              productId: event.productId,
              productName: event.productName || null,
              quantity: event.quantity,
              unitPrice: event.unitPrice || null,
              totalPrice: event.totalPrice || null,
              timestamp: eventTimestamp
            }
          })
        }
      }
    }

    console.log('✅ Analytics Save: Dados salvos com sucesso para sessionId:', data.sessionId)

    return NextResponse.json({
      success: true,
      message: 'Dados de analytics salvos com sucesso',
      sessionId: data.sessionId
    })

  } catch (error) {
    console.error('❌ Analytics Save: Erro ao salvar dados:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}