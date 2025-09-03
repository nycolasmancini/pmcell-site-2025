import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    title: 'Política de Trocas',
    content: 'Nossa política de trocas e devoluções.',
    slug: 'politica-trocas'
  })
}