import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação de admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || session.user.email !== 'admin@pmcell.com.br') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('photo') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas arquivos de imagem são permitidos' }, { status: 400 })
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Caminho para salvar a imagem
    const publicPath = path.join(process.cwd(), 'public')
    const filePath = path.join(publicPath, 'pmcell-loja.jpg')

    // Remover arquivo anterior se existir
    if (existsSync(filePath)) {
      await unlink(filePath)
    }

    // Salvar novo arquivo
    await writeFile(filePath, buffer)

    return NextResponse.json({ 
      message: 'Foto da loja atualizada com sucesso',
      filename: 'pmcell-loja.jpg'
    })

  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}