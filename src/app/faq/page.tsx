'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'pedidos' | 'entrega' | 'pagamento' | 'trocas' | 'produtos' | 'geral'
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Qual é o pedido mínimo para compras?',
    answer: 'O pedido mínimo é de 30 peças no total. Você pode combinar diferentes produtos para atingir essa quantidade. Por exemplo: 10 capas + 15 películas + 5 fones = 30 peças.',
    category: 'pedidos'
  },
  {
    id: '2',
    question: 'Qual o prazo de entrega dos pedidos?',
    answer: 'O prazo de entrega varia conforme sua região. Geralmente: São Paulo capital (1-2 dias úteis), Interior de SP (2-3 dias úteis), Demais estados (3-7 dias úteis). Após o envio, fornecemos o código de rastreamento.',
    category: 'entrega'
  },
  {
    id: '3',
    question: 'Vocês fornecem nota fiscal?',
    answer: 'Sim! Todas as vendas são acompanhadas de nota fiscal. Garantimos total transparência e legalidade em todas as transações para a segurança do seu negócio.',
    category: 'geral'
  },
  {
    id: '4',
    question: 'Como funciona o parcelamento no cartão?',
    answer: 'Aceitamos cartão de crédito com parcelamento em até 12x com juros. As taxas variam conforme a quantidade de parcelas.',
    category: 'pagamento'
  },
  {
    id: '5',
    question: 'Como faço para calcular o frete?',
    answer: 'O frete é calculado conforme seu CEP e peso dos produtos. Entre em contato via WhatsApp informando sua localização e os produtos desejados que calculamos o valor exato para você.',
    category: 'entrega'
  },
  {
    id: '6',
    question: 'Qual a garantia dos produtos?',
    answer: 'Todos os produtos têm garantia de 90 dias (3 meses) contra defeitos de fabricação. Não aceitamos trocas de produtos sujos ou riscados. O cliente paga o frete de devolução.',
    category: 'trocas'
  },
  {
    id: '7',
    question: 'Vocês trabalham com dropshipping?',
    answer: 'Não, não trabalhamos com dropshipping. Vendemos apenas para atacadistas e revendedores que fazem estoque dos produtos. Nosso foco é no comércio B2B tradicional.',
    category: 'geral'
  },
  {
    id: '8',
    question: 'Posso retirar os produtos na loja?',
    answer: 'Sim! Você pode retirar seus pedidos em nossa loja física na Rua Comendador Abdo Schahin, 62 - Loja 4, Centro, São Paulo. Funcionamos de segunda a sexta, das 8h às 17h.',
    category: 'entrega'
  },
  {
    id: '9',
    question: 'Vocês fazem videochamada para mostrar os produtos?',
    answer: 'Sim, fazemos videochamadas via WhatsApp para mostrar os produtos ao vivo! É uma ótima forma de você conhecer a qualidade antes de comprar. Entre em contato para agendar.',
    category: 'produtos'
  },
  {
    id: '10',
    question: 'Onde fica a loja física?',
    answer: 'Nossa loja fica na Rua Comendador Abdo Schahin, 62 - Loja 4, Centro, São Paulo - SP, CEP: 01023-050. Ficamos próximo à 25 de Março, na rua de trás.',
    category: 'geral'
  },
  {
    id: '12',
    question: 'Entregam para todo o Brasil?',
    answer: 'Sim, entregamos para todos os estados do Brasil via Correios e transportadoras. O prazo e valor do frete variam conforme a região de destino.',
    category: 'entrega'
  },
  {
    id: '13',
    question: 'Como posso ter certeza da segurança do envio?',
    answer: 'Utilizamos transportadoras confiáveis, fornecemos código de rastreamento, embalamos com cuidado e oferecemos suporte total até a entrega. Todas as remessas são asseguradas.',
    category: 'entrega'
  },
  {
    id: '14',
    question: 'Posso trocar produtos por outros?',
    answer: 'Sim, mas apenas em casos de defeito de fabricação ou produto enviado errado. Geramos crédito no valor do produto para usar no próximo pedido. O crédito também pode abater custos de frete.',
    category: 'trocas'
  },
  {
    id: '15',
    question: 'Vocês vendem para pessoa física?',
    answer: 'Vendemos principalmente para atacadistas e revendedores (B2B), mas também atendemos pessoas físicas que atendam ao pedido mínimo de 30 peças.',
    category: 'geral'
  }
]

export default function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas')
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)

  const categories = [
    { id: 'todas', name: 'Todas', icon: '📋' },
    { id: 'pedidos', name: 'Pedidos', icon: '🛒' },
    { id: 'entrega', name: 'Entrega', icon: '🚚' },
    { id: 'pagamento', name: 'Pagamento', icon: '💳' },
    { id: 'trocas', name: 'Trocas', icon: '↩️' },
    { id: 'produtos', name: 'Produtos', icon: '📱' },
    { id: 'geral', name: 'Geral', icon: '❓' }
  ]

  const filteredFAQ = selectedCategory === 'todas' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header showSearchBar={false} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="card p-6 animate-slide-up">
          {/* Header da Página */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Perguntas Frequentes
            </h1>
            <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
              Encontre respostas para as dúvidas mais comuns sobre nossos produtos e serviços
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
              Não encontrou sua resposta? Entre em contato conosco!
            </p>
          </div>

          {/* Filtros por Categoria */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-center" style={{ color: 'var(--foreground)' }}>
              📂 Categorias
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'text-white shadow-md transform scale-105'
                      : 'hover:shadow-sm'
                  }`}
                  style={selectedCategory === category.id ? {
                    background: 'var(--orange)',
                    color: 'white'
                  } : {
                    background: 'var(--muted)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </section>

          {/* Lista de Perguntas */}
          <section>
            <div className="space-y-4">
              {filteredFAQ.map((faq, index) => (
                <div 
                  key={faq.id} 
                  className={`bg-white rounded-lg border transition-all duration-200 hover:shadow-md animate-fade-in`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    borderColor: openFAQ === faq.id ? 'var(--orange)' : 'var(--border)'
                  }}
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full p-6 text-left flex items-start justify-between hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--foreground)' }}>
                        {faq.question}
                      </h3>
                      <div className="flex items-center gap-2">
                        {categories.find(c => c.id === faq.category)?.icon}
                        <span className="text-xs px-2 py-1 rounded-full" style={{ 
                          background: 'var(--muted)', 
                          color: 'var(--muted-foreground)' 
                        }}>
                          {categories.find(c => c.id === faq.category)?.name}
                        </span>
                      </div>
                    </div>
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${
                        openFAQ === faq.id ? 'rotate-180' : ''
                      }`}
                      style={{ background: 'var(--muted)' }}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        <polyline points="6,9 12,15 18,9"/>
                      </svg>
                    </div>
                  </button>
                  
                  {openFAQ === faq.id && (
                    <div className="px-6 pb-6">
                      <div 
                        className="border-t pt-4 animate-slide-down"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQ.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted-foreground)' }}>
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Nenhuma pergunta encontrada
                </h3>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Tente selecionar uma categoria diferente
                </p>
              </div>
            )}
          </section>

          {/* Seção de Contato */}
          <section className="mt-8">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 text-center">
              <div className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--blue)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                Ainda tem dúvidas?
              </h2>
              <p className="text-sm mb-4 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                Nossa equipe está pronta para ajudar! Entre em contato via WhatsApp ou visite 
                nossa loja física na 25 de Março. Atendimento de segunda a sexta, das 8h às 17h.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const message = encodeURIComponent('Olá! Tenho uma dúvida que não encontrei no FAQ do site.')
                    window.open(`https://wa.me/5511911304693?text=${message}`, '_blank')
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                  </svg>
                  WhatsApp
                </button>
                <a
                  href="/fale-conosco"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Fale Conosco
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  )
}