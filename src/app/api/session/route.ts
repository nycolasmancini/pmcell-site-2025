import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { whatsapp } = body

    // Validar WhatsApp brasileiro
    const whatsappRegex = /^55\d{10,11}$/
    const cleanWhatsapp = whatsapp.replace(/\D/g, '')
    
    if (!whatsappRegex.test(cleanWhatsapp)) {
      return NextResponse.json(
        { error: 'WhatsApp inválido. Use o formato brasileiro com DDD.' },
        { status: 400 }
      )
    }

    // Função auxiliar para criar resposta de fallback
    const createFallbackResponse = (sessionId: string) => {
      console.log('⚠️ Usando sessão em fallback (sem banco de dados)')
      const response = NextResponse.json({ 
        success: true, 
        sessionId,
        unlocked: true,
        fallback: true
      })
      
      response.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 dias
      })

      response.cookies.set('pricesUnlocked', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 dias
      })

      return response
    }

    // Em produção, usar conexão direta
    if (process.env.NODE_ENV === 'production') {
      try {
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
          const cookieStore = await cookies()
          const sessionId = cookieStore.get('sessionId')?.value
          
          let session
          
          if (sessionId) {
            // Buscar sessão existente
            const result = await pool.query(
              'SELECT * FROM "Session" WHERE id = $1',
              [sessionId]
            )
            session = result.rows[0]
          }

          if (!session) {
            // Criar nova sessão
            const result = await pool.query(`
              INSERT INTO "Session" (id, whatsapp, unlocked, "unlockedAt", "createdAt", "updatedAt", "lastActivity")
              VALUES (gen_random_uuid(), $1, true, NOW(), NOW(), NOW(), NOW())
              RETURNING *
            `, [cleanWhatsapp])
            session = result.rows[0]
          } else {
            // Atualizar sessão existente
            const result = await pool.query(`
              UPDATE "Session" 
              SET whatsapp = $1, unlocked = true, "unlockedAt" = NOW(), "lastActivity" = NOW(), "updatedAt" = NOW()
              WHERE id = $2
              RETURNING *
            `, [cleanWhatsapp, session.id])
            session = result.rows[0]
          }

          // Criar log do webhook
          await pool.query(`
            INSERT INTO "WebhookLog" (id, "eventType", payload, success, "createdAt")
            VALUES (gen_random_uuid(), 'PRICE_UNLOCK', $1, false, NOW())
          `, [JSON.stringify({ whatsapp: cleanWhatsapp, sessionId: session.id })])

          // Definir cookie de sessão (7 dias)
          const response = NextResponse.json({ 
            success: true, 
            sessionId: session.id,
            unlocked: true 
          })
          
          response.cookies.set('sessionId', session.id, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 dias
          })

          response.cookies.set('pricesUnlocked', 'true', {
            httpOnly: false,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 dias
          })

          return response
        } finally {
          await pool.end()
        }
      } catch (dbError) {
        console.error('❌ Erro de banco de dados em produção:', dbError)
        // Usar fallback com sessionId gerado
        const fallbackSessionId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        return createFallbackResponse(fallbackSessionId)
      }
    }

    // Em desenvolvimento, usar Prisma
    try {
      const cookieStore = await cookies()
      const sessionId = cookieStore.get('sessionId')?.value
      
      let session
      if (sessionId) {
        session = await prisma.session.findUnique({
          where: { id: sessionId }
        })
      }

      if (!session) {
        session = await prisma.session.create({
          data: {
            whatsapp: cleanWhatsapp,
            unlocked: true,
            unlockedAt: new Date()
          }
        })
      } else {
        session = await prisma.session.update({
          where: { id: session.id },
          data: {
            whatsapp: cleanWhatsapp,
            unlocked: true,
            unlockedAt: new Date(),
            lastActivity: new Date()
          }
        })
      }

      // Criar log do webhook
      await prisma.webhookLog.create({
        data: {
          eventType: 'PRICE_UNLOCK',
          payload: { whatsapp: cleanWhatsapp, sessionId: session.id },
          success: false
        }
      })

      // Definir cookie de sessão (7 dias)
      const response = NextResponse.json({ 
        success: true, 
        sessionId: session.id,
        unlocked: true 
      })
      
      response.cookies.set('sessionId', session.id, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 dias
      })

      response.cookies.set('pricesUnlocked', 'true', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 dias
      })

      return response
    } catch (dbError) {
      console.error('❌ Erro de banco de dados em desenvolvimento:', dbError)
      // Usar fallback com sessionId gerado
      const cookieStore = await cookies()
      const existingSessionId = cookieStore.get('sessionId')?.value
      const fallbackSessionId = existingSessionId || `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      return createFallbackResponse(fallbackSessionId)
    }
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value
    const pricesUnlocked = cookieStore.get('pricesUnlocked')?.value
    
    if (!sessionId) {
      return NextResponse.json({ unlocked: false })
    }

    // Se há cookie de preços desbloqueados, confiar nele como fallback
    const fallbackUnlocked = pricesUnlocked === 'true'

    // Em produção, usar conexão direta
    if (process.env.NODE_ENV === 'production') {
      try {
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
          const result = await pool.query(
            'SELECT * FROM "Session" WHERE id = $1',
            [sessionId]
          )
          
          const session = result.rows[0]
          
          if (!session) {
            // Se não há sessão no banco mas há cookie, usar fallback
            if (fallbackUnlocked) {
              console.log('⚠️ Sessão não encontrada no banco, usando cookie como fallback')
              return NextResponse.json({ 
                unlocked: true,
                sessionId,
                fallback: true
              })
            }
            return NextResponse.json({ unlocked: false })
          }

          // Atualizar última atividade
          await pool.query(
            'UPDATE "Session" SET "lastActivity" = NOW() WHERE id = $1',
            [sessionId]
          )

          return NextResponse.json({ 
            unlocked: session.unlocked,
            whatsapp: session.whatsapp,
            sessionId: session.id
          })
        } finally {
          await pool.end()
        }
      } catch (dbError) {
        console.error('❌ Erro de banco de dados em produção (GET):', dbError)
        // Usar fallback baseado em cookie
        if (fallbackUnlocked) {
          console.log('⚠️ Usando fallback de sessão (GET)')
          return NextResponse.json({ 
            unlocked: true,
            sessionId,
            fallback: true
          })
        }
        return NextResponse.json({ unlocked: false })
      }
    }

    // Em desenvolvimento, usar Prisma
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId }
      })

      if (!session) {
        // Se não há sessão no banco mas há cookie, usar fallback
        if (fallbackUnlocked) {
          console.log('⚠️ Sessão não encontrada no banco, usando cookie como fallback')
          return NextResponse.json({ 
            unlocked: true,
            sessionId,
            fallback: true
          })
        }
        return NextResponse.json({ unlocked: false })
      }

      // Atualizar última atividade
      await prisma.session.update({
        where: { id: sessionId },
        data: { lastActivity: new Date() }
      })

      return NextResponse.json({ 
        unlocked: session.unlocked,
        whatsapp: session.whatsapp,
        sessionId: session.id
      })
    } catch (dbError) {
      console.error('❌ Erro de banco de dados em desenvolvimento (GET):', dbError)
      // Usar fallback baseado em cookie
      if (fallbackUnlocked) {
        console.log('⚠️ Usando fallback de sessão (GET)')
        return NextResponse.json({ 
          unlocked: true,
          sessionId,
          fallback: true
        })
      }
      return NextResponse.json({ unlocked: false })
    }
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ unlocked: false })
  }
}