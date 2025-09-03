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

// Função para salvar carrinhos no arquivo
function saveCartsToFile(carts: CartData[]): void {
  ensureDataDirectory()
  
  try {
    fs.writeFileSync(CARTS_FILE, JSON.stringify(carts, null, 2))
  } catch (error) {
    console.error('Erro ao salvar arquivo de carrinhos:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, contacted } = await request.json()
    
    if (!sessionId || typeof contacted !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'sessionId e contacted são obrigatórios'
      }, { status: 400 })
    }

    const carts = readCartsFromFile()
    const cartIndex = carts.findIndex(cart => cart.sessionId === sessionId)
    
    if (cartIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Carrinho não encontrado'
      }, { status: 404 })
    }

    // Atualizar o status de contato
    carts[cartIndex].contacted = contacted
    
    // Salvar no arquivo
    saveCartsToFile(carts)
    
    console.log(`🔄 Carrinho ${sessionId} marcado como ${contacted ? 'contatado' : 'pendente'}`)
    
    return NextResponse.json({
      success: true,
      message: `Carrinho marcado como ${contacted ? 'contatado' : 'pendente'}`,
      sessionId,
      contacted
    })
    
  } catch (error) {
    console.error('Erro ao marcar carrinho como contatado:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}