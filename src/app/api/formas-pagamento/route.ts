import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    title: 'Formas de Pagamento',
    content: 'Conheça as formas de pagamento aceitas.',
    slug: 'formas-pagamento'
  })
}