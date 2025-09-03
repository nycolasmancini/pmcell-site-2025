import { NextRequest, NextResponse } from 'next/server'

// Dados estáticos das páginas institucionais
const staticPages = {
  'sobre-nos': {
    title: 'Sobre Nós',
    content: 'A PMCELL é uma empresa especializada em acessórios para celular com mais de 10 anos de experiência no mercado.',
    slug: 'sobre-nos'
  },
  'termos-condicoes': {
    title: 'Termos e Condições',
    content: 'Termos e condições de uso da plataforma PMCELL.',
    slug: 'termos-condicoes'
  },
  'politica-trocas': {
    title: 'Política de Trocas',
    content: 'Nossa política de trocas e devoluções.',
    slug: 'politica-trocas'
  },
  'politica-frete': {
    title: 'Política de Frete',
    content: 'Informações sobre frete e entrega.',
    slug: 'politica-frete'
  },
  'fale-conosco': {
    title: 'Fale Conosco',
    content: 'Entre em contato conosco através dos nossos canais.',
    slug: 'fale-conosco'
  },
  'faq': {
    title: 'FAQ - Perguntas Frequentes',
    content: 'Respostas para as dúvidas mais comuns.',
    slug: 'faq'
  },
  'como-comprar': {
    title: 'Como Comprar',
    content: 'Guia passo a passo de como fazer sua compra.',
    slug: 'como-comprar'
  },
  'formas-pagamento': {
    title: 'Formas de Pagamento',
    content: 'Conheça as formas de pagamento aceitas.',
    slug: 'formas-pagamento'
  },
  'politica-privacidade': {
    title: 'Política de Privacidade',
    content: 'Nossa política de privacidade e proteção de dados.',
    slug: 'politica-privacidade'
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    const page = staticPages[slug as keyof typeof staticPages]
    
    if (!page) {
      return NextResponse.json(
        { error: 'Página não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}