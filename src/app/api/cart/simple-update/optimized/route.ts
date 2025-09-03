import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { cartCache, getCacheKey } from '@/lib/cache'

// Arquivo para armazenar carrinhos (fallback sem banco)
const CARTS_FILE = path.join(process.cwd(), 'data', 'abandoned-carts.json')

// Rate limiting com TTL mais eficiente
class RateLimiter {
  private limits = new Map<string, { count: number; resetTime: number }>()
  private readonly windowMs = 60 * 1000 // 1 minuto
  private readonly maxRequests = 15 // Reduzido de 30 para 15

  check(sessionId: string): boolean {
    const now = Date.now()
    const clientData = this.limits.get(sessionId)

    // Limpeza automática de entradas expiradas
    if (clientData && now > clientData.resetTime) {
      this.limits.delete(sessionId)
    }

    const current = this.limits.get(sessionId)
    if (!current) {
      this.limits.set(sessionId, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    if (current.count >= this.maxRequests) {
      return false
    }

    current.count++
    return true
  }

  // Limpeza periódica de entradas expiradas
  cleanup() {
    const now = Date.now()
    for (const [key, data] of this.limits.entries()) {
      if (now > data.resetTime) {
        this.limits.delete(key)
      }
    }
  }
}

const rateLimiter = new RateLimiter()

// Limpeza automática a cada 5 minutos
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000)

// Cache em memória para evitar I/O desnecessário
let cartsCache: any[] | null = null
let lastFileModTime: number = 0

// Garantir que a pasta data existe
async function ensureDataDir() {
  const dataDir = path.dirname(CARTS_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Carregar carrinhos com cache inteligente
async function loadCarts(): Promise<any[]> {
  try {
    // Verificar se arquivo existe
    let stats
    try {
      stats = await fs.stat(CARTS_FILE)
    } catch {
      // Arquivo não existe, criar array vazio
      cartsCache = []
      return []
    }

    // Se cache está válido e arquivo não foi modificado, usar cache
    if (cartsCache && stats.mtime.getTime() === lastFileModTime) {
      return cartsCache
    }

    // Carregar do arquivo
    const data = await fs.readFile(CARTS_FILE, 'utf8')
    cartsCache = JSON.parse(data)
    lastFileModTime = stats.mtime.getTime()
    
    return cartsCache || []
  } catch (error) {
    console.error('Erro ao carregar carrinhos:', error)
    cartsCache = []
    return []
  }
}

// Salvar carrinhos de forma assíncrona e eficiente
async function saveCarts(carts: any[]) {
  try {
    await ensureDataDir()
    
    // Filtrar dados desnecessários antes de salvar
    const optimizedCarts = carts.map(cart => ({
      id: cart.id,
      sessionId: cart.sessionId,
      whatsapp: cart.whatsapp,
      cartData: {
        items: cart.cartData.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        total: cart.cartData.total,
        itemsCount: cart.cartData.items.length
      },
      // Remover analyticsData se for muito grande ou desnecessário
      analyticsData: cart.analyticsData ? {
        pageViews: cart.analyticsData.pageViews || 0,
        timeOnSite: cart.analyticsData.timeOnSite || 0
      } : null,
      lastActivity: cart.lastActivity,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      webhookSent: cart.webhookSent || false
    }))

    await fs.writeFile(CARTS_FILE, JSON.stringify(optimizedCarts, null, 2))
    cartsCache = optimizedCarts
    lastFileModTime = Date.now()
  } catch (error) {
    console.error('Erro ao salvar carrinhos:', error)
    throw error
  }
}

// Validação otimizada
function validateCartData(cartData: any): { valid: boolean; error?: string } {
  if (!cartData || typeof cartData !== 'object') {
    return { valid: false, error: 'Dados do carrinho inválidos' }
  }
  
  if (!Array.isArray(cartData.items)) {
    return { valid: false, error: 'Items devem ser um array' }
  }
  
  if (cartData.items.length > 50) {
    return { valid: false, error: 'Muitos itens no carrinho' }
  }
  
  if (typeof cartData.total !== 'number' || cartData.total < 0) {
    return { valid: false, error: 'Total inválido' }
  }
  
  // Validar cada item
  for (const item of cartData.items) {
    if (!item.id || !item.productId || !item.name || 
        typeof item.quantity !== 'number' || typeof item.unitPrice !== 'number' ||
        item.quantity <= 0 || item.unitPrice < 0) {
      return { valid: false, error: 'Item inválido no carrinho' }
    }
  }
  
  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    // Headers para compressão
    const response = new NextResponse()
    
    const body = await request.json()
    const { sessionId, whatsapp, cartData, analyticsData, lastActivity } = body

    // Validações básicas
    if (!sessionId || !cartData) {
      return NextResponse.json(
        { error: 'sessionId e cartData são obrigatórios' },
        { status: 400 }
      )
    }

    // Rate limiting
    if (!rateLimiter.check(sessionId)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns segundos.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    // Validar dados do carrinho
    const validation = validateCartData(cartData)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Carregar carrinhos com cache
    const carts = await loadCarts()
    
    // Verificar se carrinho tem itens
    const hasItems = cartData.items && cartData.items.length > 0
    
    if (!hasItems) {
      // Remover carrinho se vazio
      const filteredCarts = carts.filter(cart => cart.sessionId !== sessionId)
      await saveCarts(filteredCarts)
      
      // Invalidar cache relacionado
      cartCache.delete(getCacheKey('cart', sessionId))
      
      return NextResponse.json({ 
        message: 'Carrinho vazio removido',
        removed: true 
      })
    }

    // Buscar carrinho existente
    const existingIndex = carts.findIndex(cart => cart.sessionId === sessionId)
    const now = new Date()
    
    const cartRecord = {
      id: existingIndex >= 0 ? carts[existingIndex].id : `cart_${Date.now()}`,
      sessionId,
      whatsapp: whatsapp || null,
      cartData: {
        items: cartData.items,
        total: cartData.total,
        itemsCount: cartData.items.length
      },
      // Comprimir analyticsData
      analyticsData: analyticsData ? {
        pageViews: analyticsData.pageViews || 0,
        timeOnSite: analyticsData.timeOnSite || 0
      } : null,
      lastActivity: lastActivity ? new Date(lastActivity).toISOString() : now.toISOString(),
      webhookSent: existingIndex >= 0 ? carts[existingIndex].webhookSent : false,
      webhookSentAt: existingIndex >= 0 ? carts[existingIndex].webhookSentAt : null,
      createdAt: existingIndex >= 0 ? carts[existingIndex].createdAt : now.toISOString(),
      updatedAt: now.toISOString()
    }

    if (existingIndex >= 0) {
      carts[existingIndex] = cartRecord
    } else {
      carts.push(cartRecord)
    }

    // Salvar de forma assíncrona
    await saveCarts(carts)

    // Cache o resultado
    cartCache.set(getCacheKey('cart', sessionId), cartRecord, 1000 * 60 * 10) // 10 min

    // Log otimizado (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🛒 Carrinho salvo: ${sessionId}, ${cartData.items.length} itens, R$ ${cartData.total.toFixed(2)}`)
    }

    return NextResponse.json({
      message: 'Carrinho salvo',
      id: cartRecord.id,
      saved: true,
      method: 'optimized-file-storage'
    }, {
      headers: {
        'Cache-Control': 'no-store', // Carrinho não deve ser cacheado pelo navegador
        'X-RateLimit-Remaining': '14' // Informar limite restante
      }
    })

  } catch (error) {
    console.error('❌ Erro ao salvar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId é obrigatório' },
        { status: 400 }
      )
    }

    // Tentar cache primeiro
    const cached = cartCache.get(getCacheKey('cart', sessionId))
    if (cached) {
      return NextResponse.json({
        found: true,
        cart: cached,
        method: 'cache'
      }, {
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 min cache
          'X-Cache': 'HIT'
        }
      })
    }

    // Carregar do arquivo se não estiver em cache
    const carts = await loadCarts()
    const cart = carts.find(cart => cart.sessionId === sessionId)

    if (!cart) {
      return NextResponse.json({ found: false, cart: null })
    }

    // Cache para próximas requisições
    cartCache.set(getCacheKey('cart', sessionId), cart, 1000 * 60 * 10)

    return NextResponse.json({
      found: true,
      cart,
      method: 'file-storage'
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300',
        'X-Cache': 'MISS'
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}