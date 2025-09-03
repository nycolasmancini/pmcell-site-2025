import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    title: 'Política de Frete',
    content: 'Informações sobre frete e entrega.',
    slug: 'politica-frete'
  })
}