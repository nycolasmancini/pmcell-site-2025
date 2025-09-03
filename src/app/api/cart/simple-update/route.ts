import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Arquivo simples para armazenar carrinhos (fallback sem banco)
const CARTS_FILE = path.join(process.cwd(), 'data', 'abandoned-carts.json')

// Rate limiting simples (em memória)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 30 // 30 requests por minuto

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

// Função de rate limiting
function checkRateLimit(sessionId: string): boolean {
  const now = Date.now()
  const clientData = rateLimitMap.get(sessionId)

  if (!clientData || now > clientData.resetTime) {
    // Nova janela de tempo
    rateLimitMap.set(sessionId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false // Rate limit excedido
  }

  // Incrementar contador
  clientData.count++
  rateLimitMap.set(sessionId, clientData)
  return true
}

// Validar dados do carrinho (versão mais flexível e robusta)
function validateCartData(cartData: any): boolean {
  console.log('🔍 Iniciando validação do cartData:', JSON.stringify(cartData, null, 2))
  
  if (!cartData || typeof cartData !== 'object') {
    console.log('❌ Validação: cartData não é objeto válido', cartData)
    return false
  }
  
  // Permitir carrinho vazio (será removido depois)
  if (!cartData.items) {
    console.log('⚠️ Validação: cartData.items não existe, assumindo carrinho vazio')
    cartData.items = []
  }
  
  if (!Array.isArray(cartData.items)) {
    console.log('❌ Validação: cartData.items não é array', typeof cartData.items)
    return false
  }
  
  // Permitir total ausente ou zero para carrinho vazio
  if (cartData.total === undefined || cartData.total === null) {
    console.log('⚠️ Validação: cartData.total ausente, assumindo 0')
    cartData.total = 0
  }
  
  if (typeof cartData.total !== 'number' || cartData.total < 0) {
    console.log('❌ Validação: cartData.total inválido:', cartData.total, typeof cartData.total)
    return false
  }
  
  // Se carrinho vazio, validação OK
  if (cartData.items.length === 0) {
    console.log('✅ Validação: carrinho vazio válido')
    return true
  }
  
  // Validar cada item de forma mais flexível
  for (let i = 0; i < cartData.items.length; i++) {
    const item = cartData.items[i]
    console.log(`🔍 Validando item ${i}:`, JSON.stringify(item, null, 2))
    
    if (!item || typeof item !== 'object') {
      console.log(`❌ Validação: Item ${i} não é objeto válido`, item)
      return false
    }
    
    // Permitir id ausente, gerar automático
    if (!item.id) {
      item.id = `item_${i}_${Date.now()}`
      console.log(`⚠️ Validação: Item ${i} sem id, gerando: ${item.id}`)
    }
    
    if (typeof item.id !== 'string') {
      console.log(`❌ Validação: Item ${i} id não é string:`, item.id, typeof item.id)
      return false
    }
    
    if (!item.productId || typeof item.productId !== 'string') {
      console.log(`❌ Validação: Item ${i} sem productId válido:`, item.productId, typeof item.productId)
      return false
    }
    
    if (!item.name || typeof item.name !== 'string') {
      console.log(`❌ Validação: Item ${i} sem name válido:`, item.name, typeof item.name)
      return false
    }
    
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      console.log(`❌ Validação: Item ${i} com quantity inválida:`, item.quantity, typeof item.quantity)
      return false
    }
    
    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
      console.log(`❌ Validação: Item ${i} com unitPrice inválido:`, item.unitPrice, typeof item.unitPrice)
      return false
    }
    
    console.log(`✅ Item ${i} válido`)
  }
  
  console.log('✅ Validação: cartData válido com', cartData.items.length, 'itens, total:', cartData.total)
  return true
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

    // Rate limiting
    if (!checkRateLimit(sessionId)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns segundos.' },
        { status: 429 }
      )
    }

    // Validar dados do carrinho
    if (!validateCartData(cartData)) {
      return NextResponse.json(
        { error: 'Dados do carrinho inválidos' },
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

    console.log(`🛒 Server: Carrinho salvo para sessionId: ${sessionId}`)
    console.log(`🛒 Server: ${cartData.items.length} itens, total: R$ ${cartData.total.toFixed(2)}, lastActivity: ${new Date(lastActivity || Date.now()).toLocaleTimeString()}`)
    console.log(`🛒 Server: Método: ${existingIndex >= 0 ? 'UPDATE' : 'CREATE'}, WhatsApp: ${whatsapp ? 'Sim' : 'Não'}`)

    return NextResponse.json({
      message: 'Carrinho salvo no servidor (arquivo)',
      id: cartRecord.id,
      saved: true,
      method: 'file-storage'
    })

  } catch (error) {
    console.error('❌ Erro ao salvar carrinho no servidor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
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
      cart,
      method: 'file-storage'
    })

  } catch (error) {
    console.error('❌ Erro ao buscar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}