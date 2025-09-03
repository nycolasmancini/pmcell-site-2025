import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    title: 'Política de Privacidade',
    content: 'Nossa política de privacidade e proteção de dados.',
    slug: 'politica-privacidade'
  })
}