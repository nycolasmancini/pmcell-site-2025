import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Em produção, usar conexão direta
    if (process.env.NODE_ENV === 'production') {
      const { Pool } = require('pg')
      const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
      
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      })

      try {
        const result = await pool.query('SELECT * FROM "CompanySettings" LIMIT 1')
        let settings = result.rows[0]
        
        if (!settings) {
          // Criar configurações padrão
          const insertResult = await pool.query(`
            INSERT INTO "CompanySettings" ("id", "companyName", "primaryColor", "createdAt", "updatedAt") 
            VALUES ('default', 'PMCELL', '#FC6D36', NOW(), NOW()) 
            RETURNING *
          `)
          settings = insertResult.rows[0]
        }

        return NextResponse.json(settings)
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    let settings = await prisma.companySettings.findFirst()
    
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          companyName: 'PMCELL',
          primaryColor: '#FC6D36',
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const logoFile = formData.get('logo') as File

    if (!logoFile) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Verificar tipo de arquivo
    if (!logoFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Arquivo deve ser uma imagem' }, { status: 400 })
    }

    // Converter para base64
    const bytes = await logoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Logo = `data:${logoFile.type};base64,${buffer.toString('base64')}`

    // Em produção, usar conexão direta
    if (process.env.NODE_ENV === 'production') {
      const { Pool } = require('pg')
      const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
      
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      })

      try {
        // Verificar se já existe configuração
        const existingResult = await pool.query('SELECT * FROM "CompanySettings" LIMIT 1')
        let settings

        if (existingResult.rows.length > 0) {
          // Atualizar existente
          const updateResult = await pool.query(
            'UPDATE "CompanySettings" SET logo = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
            [base64Logo, existingResult.rows[0].id]
          )
          settings = updateResult.rows[0]
        } else {
          // Criar novo registro
          const insertResult = await pool.query(`
            INSERT INTO "CompanySettings" ("id", "companyName", "primaryColor", "logo", "createdAt", "updatedAt") 
            VALUES ('default', 'PMCELL', '#FC6D36', $1, NOW(), NOW()) 
            RETURNING *
          `, [base64Logo])
          settings = insertResult.rows[0]
        }

        return NextResponse.json(settings)
      } finally {
        await pool.end()
      }
    }

    // Em desenvolvimento, usar Prisma
    let settings = await prisma.companySettings.findFirst()
    
    if (settings) {
      // Atualizar existente
      settings = await prisma.companySettings.update({
        where: { id: settings.id },
        data: { logo: base64Logo }
      })
    } else {
      // Criar novo registro
      settings = await prisma.companySettings.create({
        data: {
          companyName: 'PMCELL',
          primaryColor: '#FC6D36',
          logo: base64Logo
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}