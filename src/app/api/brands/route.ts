import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAllTablesExist } from '@/lib/table-sync'

export async function GET() {
  try {
    console.log('🔍 Tentando buscar brands...')
    
    // Verificar e criar tabelas se necessário (sincronização direta)
    const tablesExist = await ensureAllTablesExist()
    if (!tablesExist) {
      console.error('❌ Não foi possível garantir a existência das tabelas')
      return NextResponse.json([], { status: 200 })
    }
    
    const brands = await prisma.brand.findMany({
      include: {
        models: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    console.log(`✅ ${brands.length} brands encontradas`)
    return NextResponse.json(brands)
  } catch (error) {
    console.error('Erro ao buscar brands:', error)
    
    // Se for erro de tabela não existe, retornar array vazio com log específico
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.error('❌ Tabela Brand não existe no banco de dados. Execute o deploy para sincronizar o schema.')
      return NextResponse.json([], { status: 200 })
    }
    
    // Para outros erros, retornar array vazio para evitar problemas no frontend
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Nome da marca é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar e criar tabelas se necessário (sincronização direta)
    const tablesExist = await ensureAllTablesExist()
    if (!tablesExist) {
      return NextResponse.json(
        { error: 'Não foi possível sincronizar as tabelas do banco de dados' },
        { status: 503 }
      )
    }

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        order: 0
      },
      include: {
        models: true
      }
    })

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar brand:', error)
    
    // Se for erro de tabela não existe, retornar mensagem específica
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Tabela Brand não existe. Execute a sincronização do banco de dados.' },
        { status: 503 }
      )
    }
    
    // Se for erro de duplicação (unique constraint)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Uma marca com este nome já existe' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}