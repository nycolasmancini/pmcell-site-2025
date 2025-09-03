'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function FaleConosco() {
  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '')
  }

  const openWhatsApp = (phone: string) => {
    const cleanPhone = formatPhoneForWhatsApp(phone)
    const message = encodeURIComponent('Olá! Vim através do site da PMCELL São Paulo. Gostaria de mais informações.')
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header showSearchBar={false} />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="card p-6 animate-slide-up">
          {/* Header da Página */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Fale Conosco
            </h1>
            <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
              Entre em contato com nossa equipe e tire suas dúvidas
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
              Atendimento personalizado para atacadistas e revendedores
            </p>
          </div>

          {/* Destaque WhatsApp */}
          <section className="mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                  💬 Atendimento via WhatsApp
                </h2>
                <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
                  Nosso canal principal para pedidos, dúvidas e suporte
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => openWhatsApp('(11) 91130-4693')}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--green)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>
                        WhatsApp 1
                      </h3>
                      <p className="text-lg font-bold text-green-600">(11) 91130-4693</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Clique para conversar
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => openWhatsApp('(11) 98132-6609')}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--green)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>
                        WhatsApp 2
                      </h3>
                      <p className="text-lg font-bold text-green-600">(11) 98132-6609</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Clique para conversar
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* Outras Formas de Contato */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center" style={{ color: 'var(--foreground)' }}>
              Outros Canais de Atendimento
            </h2>
            
            <div className="space-y-6">
              {/* Email */}
              <div className="text-center">
                <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                  📧 Email do Gerente
                </h3>
                <a 
                  href="mailto:nycolas@pmcellsaopaulo.com.br?subject=Contato via Site PMCELL"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm block mb-2 break-all"
                >
                  nycolas@pmcellsaopaulo.com.br
                </a>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Para dúvidas e reclamações diretamente com o gerente
                </p>
              </div>

              {/* Loja Física */}
              <div className="text-center">
                <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                  🏪 Loja Física
                </h3>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                  Rua Comendador Abdo Schahin, 62 - Loja 4
                </p>
                <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Centro, São Paulo - SP, CEP: 01023-050
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Próximo à 25 de Março, na rua de trás
                </p>
              </div>
            </div>
          </section>

          {/* Horário de Funcionamento */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center" style={{ color: 'var(--foreground)' }}>
              ⏰ Horários de Funcionamento
            </h2>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--orange)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                  Segunda a Sexta-feira
                </h3>
                <div className="text-2xl font-bold mb-3" style={{ color: 'var(--orange)' }}>
                  8h às 17h
                </div>
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                      🏪 Loja Física
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Atendimento presencial e retirada de produtos
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                      💬 WhatsApp
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Atendimento online e pedidos
                    </p>
                  </div>
                </div>
                <div className="mt-4 bg-orange-100 rounded-lg p-3">
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    📅 <strong>Sábados, Domingos e Feriados:</strong> Fechado
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Como nos Encontrar */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center" style={{ color: 'var(--foreground)' }}>
              📍 Como nos Encontrar
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Endereço Completo
                  </h4>
                  <div className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <p><strong>Rua Comendador Abdo Schahin, 62</strong></p>
                    <p>Loja 4</p>
                    <p>Centro, São Paulo - SP</p>
                    <p>CEP: 01023-050</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                    </svg>
                    Referências
                  </h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                      <span>Próximo à famosa 25 de Março</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                      <span>Na rua de trás da 25 de Março</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                      <span>Centro comercial tradicional</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                      <span>Fácil acesso por transporte público</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <div className="w-24 h-24 rounded-lg mx-auto mb-4 flex items-center justify-center bg-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="1">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                  📱 Localização no Mapa
                </h4>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  Clique no botão abaixo para ver nossa localização exata no Google Maps
                </p>
                <a
                  href="https://share.google/9z8CDEFDLaa4vOXs3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Abrir no Google Maps
                </a>
              </div>
            </div>
          </section>

          {/* Dicas para Contato */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                💡 Dicas para um Atendimento Mais Rápido
              </h2>
              <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-4">
                  <div className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--green)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    Informe os Produtos
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Nos diga quais produtos você tem interesse e quantidades
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--blue)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    Sua Localização
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Informe sua cidade para calcularmos o frete
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--orange)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    Horário Comercial
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Entre em contato de segunda a sexta, 8h às 17h
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}