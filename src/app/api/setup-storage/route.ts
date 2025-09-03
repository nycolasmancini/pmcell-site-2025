import { NextResponse } from 'next/server'
import { setupStorage } from '@/lib/setup-storage'

export async function POST() {
  try {
    const result = await setupStorage()
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Storage configurado com sucesso!',
        success: true 
      })
    } else {
      return NextResponse.json({ 
        message: 'Erro ao configurar storage',
        error: result.error,
        success: false 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Erro no setup:', error)
    return NextResponse.json({ 
      message: 'Erro interno do servidor',
      error: error,
      success: false 
    }, { status: 500 })
  }
}