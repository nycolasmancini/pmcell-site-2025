import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    title: 'Termos e Condições',
    content: 'Termos e condições de uso da plataforma PMCELL.',
    slug: 'termos-condicoes'
  })
}