import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CARTS_FILE = path.join(process.cwd(), 'data', 'abandoned-carts.json')

interface CartData {
  sessionId: string
  whatsapp: string
  cartData: {
    items: Array<{
      id: string
      productId: string
      name: string
      quantity: number
      unitPrice: number
    }>
    total: number
  }
  analyticsData: {
    sessionId: string
    categoriesVisited: string[]
    productsViewed: string[]
    searchQueries?: string[]
    timeOnSite?: number
  }
  lastActivity: number | string
  webhookSent: boolean
  createdAt: number | string
  contacted?: boolean
}

// Função para garantir que o diretório existe
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Função para ler carrinhos do arquivo
function readCartsFromFile(): CartData[] {
  ensureDataDirectory()
  
  if (!fs.existsSync(CARTS_FILE)) {
    return []
  }
  
  try {
    const data = fs.readFileSync(CARTS_FILE, 'utf8')
    const carts = JSON.parse(data)
    return Array.isArray(carts) ? carts : []
  } catch (error) {
    console.error('Erro ao ler arquivo de carrinhos:', error)
    return []
  }
}

// Função para determinar status do carrinho
function getCartStatus(cart: CartData) {
  const now = Date.now()
  
  // Converter lastActivity para timestamp se for string
  let lastActivityTime = cart.lastActivity
  if (typeof lastActivityTime === 'string') {
    lastActivityTime = new Date(lastActivityTime).getTime()
  }
  
  const timeSinceLastActivity = now - lastActivityTime
  const ACTIVE_TIME = 2 * 60 * 1000 // 2 minutos
  const ABANDON_TIME = 1 * 60 * 1000 // 1 minuto (para testes)
  
  if (timeSinceLastActivity < ACTIVE_TIME) {
    return {
      status: 'active',
      color: 'green',
      label: 'Ativo',
      timeSince: Math.floor(timeSinceLastActivity / 1000)
    }
  } else if (timeSinceLastActivity < ABANDON_TIME || !cart.webhookSent) {
    return {
      status: 'idle',
      color: 'yellow',
      label: 'Inativo',
      timeSince: Math.floor(timeSinceLastActivity / 1000)
    }
  } else {
    return {
      status: 'abandoned',
      color: 'red',
      label: 'Abandonado',
      timeSince: Math.floor(timeSinceLastActivity / 1000)
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const carts = readCartsFromFile()
    const now = Date.now()
    
    // Filtrar carrinhos dos últimos 24 horas e adicionar informações de status
    const recentCarts = carts
      .filter(cart => {
        let createdTime = cart.createdAt
        if (typeof createdTime === 'string') {
          createdTime = new Date(createdTime).getTime()
        }
        return (now - createdTime) < 24 * 60 * 60 * 1000 // 24 horas
      })
      .map((cart: any) => {
        const status = getCartStatus(cart)
        
        return {
          id: cart.sessionId,
          whatsapp: cart.whatsapp,
          status: status.status,
          statusLabel: status.label,
          statusColor: status.color,
          timeSinceLastActivity: status.timeSince,
          lastActivity: new Date(typeof cart.lastActivity === 'string' ? cart.lastActivity : cart.lastActivity).toLocaleString('pt-BR'),
          createdAt: new Date(typeof cart.createdAt === 'string' ? cart.createdAt : cart.createdAt).toLocaleString('pt-BR'),
          webhookSent: cart.webhookSent,
          cartItems: cart.cartData.items.length,
          cartTotal: cart.cartData.total,
          categoriesVisited: cart.analyticsData.categoriesVisited || [],
          productsViewed: cart.analyticsData.productsViewed || [],
          searchQueries: cart.analyticsData.searchQueries || [],
          timeOnSite: Math.floor((cart.analyticsData.timeOnSite || 0) / 1000),
          cartData: cart.cartData,
          contacted: cart.contacted || false
        }
      })
      .sort((a, b) => b.timeSinceLastActivity - a.timeSinceLastActivity) // Mais recentes primeiro
    
    // Estatísticas
    const stats = {
      total: recentCarts.length,
      active: recentCarts.filter(c => c.status === 'active').length,
      idle: recentCarts.filter(c => c.status === 'idle').length,
      abandoned: recentCarts.filter(c => c.status === 'abandoned').length,
      pending: recentCarts.filter(c => !c.contacted).length,
      completed: recentCarts.filter(c => c.contacted).length
    }
    
    return NextResponse.json({
      success: true,
      carts: recentCarts,
      stats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erro ao buscar carrinhos:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}