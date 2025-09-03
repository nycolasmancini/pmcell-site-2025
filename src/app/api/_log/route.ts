import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Log simples para desenvolvimento
    console.log('📝 Client Log:', {
      timestamp: new Date().toISOString(),
      ...data
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging:', error)
    return NextResponse.json({ success: false }, { status: 400 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}