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

    // Buscar sessão existente ou criar nova
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
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value
    
    if (!sessionId) {
      return NextResponse.json({ unlocked: false })
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
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
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ unlocked: false })
  }
}