import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    title: 'Fale Conosco',
    content: 'Entre em contato conosco através dos nossos canais.',
    slug: 'fale-conosco'
  })
}