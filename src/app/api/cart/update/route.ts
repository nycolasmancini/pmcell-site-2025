import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Arquivo para armazenar carrinhos
const CARTS_FILE = path.join(process.cwd(), 'data', 'abandoned-carts.json')

// Garantir que a pasta data existe
function ensureDataDir() {
  const dataDir = path.dirname(CARTS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Carregar carrinhos do arquivo
function loadCarts(): any[] {
  try {
    if (fs.existsSync(CARTS_FILE)) {
      const data = fs.readFileSync(CARTS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Erro ao carregar carrinhos:', error)
  }
  return []
}

// Salvar carrinhos no arquivo
function saveCarts(carts: any[]) {
  try {
    ensureDataDir()
    fs.writeFileSync(CARTS_FILE, JSON.stringify(carts, null, 2))
  } catch (error) {
    console.error('Erro ao salvar carrinhos:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      sessionId,
      whatsapp,
      cartData,
      analyticsData,
      lastActivity
    } = body

    if (!sessionId || !cartData) {
      return NextResponse.json(
        { error: 'sessionId e cartData são obrigatórios' },
        { status: 400 }
      )
    }

    // Carregar carrinhos existentes
    const carts = loadCarts()
    
    // Verificar se carrinho tem itens
    const hasItems = cartData.items && cartData.items.length > 0
    
    if (!hasItems) {
      // Remover carrinho se vazio
      const filteredCarts = carts.filter(cart => cart.sessionId !== sessionId)
      saveCarts(filteredCarts)
      
      return NextResponse.json({ 
        message: 'Carrinho vazio removido',
        removed: true 
      })
    }

    // Buscar carrinho existente
    const existingIndex = carts.findIndex(cart => cart.sessionId === sessionId)
    
    const cartRecord = {
      id: existingIndex >= 0 ? carts[existingIndex].id : `cart_${Date.now()}`,
      sessionId,
      whatsapp: whatsapp || null,
      cartData,
      analyticsData: analyticsData || null,
      lastActivity: new Date(lastActivity || Date.now()).toISOString(),
      webhookSent: false,
      webhookSentAt: null,
      createdAt: existingIndex >= 0 ? carts[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (existingIndex >= 0) {
      // Atualizar existente
      carts[existingIndex] = { ...carts[existingIndex], ...cartRecord }
    } else {
      // Criar novo
      carts.push(cartRecord)
    }

    // Salvar de volta
    saveCarts(carts)

    return NextResponse.json({
      message: 'Carrinho salvo no servidor',
      id: cartRecord.id,
      saved: true
    })

  } catch (error) {
    console.error('Cart save error:', error instanceof Error ? error.message : 'Unknown error')
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

    const carts = loadCarts()
    const cart = carts.find(cart => cart.sessionId === sessionId)

    if (!cart) {
      return NextResponse.json({ found: false, cart: null })
    }

    return NextResponse.json({
      found: true,
      cart: {
        id: cart.id,
        sessionId: cart.sessionId,
        whatsapp: cart.whatsapp,
        cartData: cart.cartData,
        analyticsData: cart.analyticsData,
        lastActivity: cart.lastActivity,
        webhookSent: cart.webhookSent,
        webhookSentAt: cart.webhookSentAt
      }
    })

  } catch (error) {
    console.error('Cart fetch error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}