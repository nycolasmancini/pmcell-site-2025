import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    title: 'FAQ - Perguntas Frequentes',
    content: 'Respostas para as dúvidas mais comuns.',
    slug: 'faq'
  })
}