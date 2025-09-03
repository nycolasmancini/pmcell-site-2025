import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    title: 'Como Comprar',
    content: 'Guia passo a passo de como fazer sua compra.',
    slug: 'como-comprar'
  })
}