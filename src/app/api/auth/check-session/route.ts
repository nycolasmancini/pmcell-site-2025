import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('Check session API - Verificando sessão...')
    console.log('Check session API - Headers:', Object.fromEntries(request.headers.entries()))
    
    const session = await getServerSession(authOptions)
    
    console.log('Check session API - Resultado getServerSession:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userDetails: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      } : null
    })
    
    if (!session || !session.user) {
      console.log('Check session API - Nenhuma sessão encontrada')
      const response = NextResponse.json({
        authenticated: false,
        user: null,
        debug: 'No session found'
      }, { status: 200 })
      
      // Headers CORS
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET')
      return response
    }
    
    // Verificar se o usuário tem acesso admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EMPLOYEE') {
      console.log('Check session API - Role inválido:', session.user.role)
      const response = NextResponse.json({
        authenticated: false,
        user: null,
        error: 'Invalid role',
        debug: `Role ${session.user.role} not allowed`
      }, { status: 403 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }
    
    console.log('Check session API - Sessão válida confirmada')
    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      },
      debug: 'Session valid'
    }, { status: 200 })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
    
  } catch (error) {
    console.error('Check session API - Erro:', error)
    const response = NextResponse.json({
      authenticated: false,
      user: null,
      error: 'Session check failed',
      debug: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}