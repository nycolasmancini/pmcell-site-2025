import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    title: 'Sobre Nós',
    content: 'A PMCELL é uma empresa especializada em acessórios para celular com mais de 10 anos de experiência no mercado.',
    slug: 'sobre-nos'
  })
}