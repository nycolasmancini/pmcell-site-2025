'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface ShippingCompany {
  id: string
  name: string
  logo?: string | null
  isActive: boolean
  order: number
}

export default function PoliticaFrete() {
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShippingCompanies()
  }, [])

  const fetchShippingCompanies = async () => {
    try {
      const response = await fetch('/api/shipping-companies')
      if (response.ok) {
        const companies = await response.json()
        setShippingCompanies(companies)
      }
    } catch (error) {
      console.error('Erro ao carregar transportadoras:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header showSearchBar={false} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="card p-6 animate-slide-up">
          {/* Header da Página */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Política de Frete e Entrega
            </h1>
            <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
              Informações completas sobre envio, prazos e entrega dos produtos
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
              Entregamos para todo o Brasil com total segurança
            </p>
          </div>

          {/* Transportadoras */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Transportadoras Parceiras
            </h2>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                🚚 Principais Transportadoras Utilizadas
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Carregando transportadoras...
                  </div>
                </div>
              ) : (
                <>
                  {shippingCompanies.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {shippingCompanies.map((company) => (
                        <div key={company.id} className="bg-white rounded-lg p-3 text-center shadow-sm">
                          <div className="h-10 mb-2 flex items-center justify-center">
                            {company.logo ? (
                              <img 
                                src={company.logo} 
                                alt={company.name}
                                className="max-h-full max-w-full object-contain"
                                style={{ maxWidth: 'calc(100% - 16px)' }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-200">
                                <span className="text-xs text-gray-500">Logo</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-medium">{company.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Nenhuma transportadora cadastrada. Entre em contato para mais informações.
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                  💡 Flexibilidade Total
                </h4>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <strong>Você escolhe!</strong> Além das transportadoras parceiras, também coletamos 
                  e enviamos via qualquer transportadora de sua preferência. Basta informar!
                </p>
              </div>
            </div>
          </section>

          {/* Cálculo de Frete */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Como é Calculado o Frete
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-center">
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    ⚖️ Peso dos Produtos
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Calculamos com base no peso total dos itens do seu pedido
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    📦 Volume da Embalagem
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Consideramos o volume necessário para embalar com segurança
                  </p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    📍 CEP de Destino
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    A distância até seu endereço influencia no valor final
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 rounded-lg p-6 border-l-4" style={{ borderColor: '#F59E0B' }}>
              <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--foreground)' }}>
                💰 Cálculo Automático
              </h3>
              <p className="text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                <strong>Com o pedido feito em nosso catálogo</strong>, conseguimos calcular o frete 
                automaticamente e oferecer o melhor preço entre as transportadoras disponíveis.
              </p>
            </div>
          </section>

          {/* Prazos de Entrega */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Prazos de Entrega
            </h2>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                  🇧🇷 Todo o Brasil
                </h3>
                <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
                  Prazo de <strong>1 a 9 dias úteis</strong> dependendo do seu CEP
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--green)' }}>
                    1-2 dias
                  </div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Estado de São Paulo
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Capital e interior
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--blue)' }}>
                    2-4 dias
                  </div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Sudeste e Centro-Oeste
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Principais regiões
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--orange)' }}>
                    5-9 dias
                  </div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Norte e Nordeste
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Demais regiões
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-white rounded-lg p-4">
                <p className="text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
                  <strong>📝 Importante:</strong> Prazos contados a partir da data de postagem 
                  (após aprovação do pagamento e separação em até 24h úteis)
                </p>
              </div>
            </div>
          </section>

          {/* Seguro Incluso */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Seguro Incluído
            </h2>
            
            <div className="bg-green-50 rounded-lg p-6">
              <div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                    🛡️ Proteção Total Garantida
                  </h3>
                  <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                    <strong>Todas as mercadorias incluem seguro!</strong> Seus produtos estão 
                    protegidos contra danos ou extravios durante o transporte.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                        ✅ O que está coberto:
                      </h4>
                      <ul className="space-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <li>• Danos durante o transporte</li>
                        <li>• Extravio da mercadoria</li>
                        <li>• Produtos danificados na entrega</li>
                        <li>• Avarias por manuseio inadequado</li>
                      </ul>
                    </div>
                    <div className="bg-green-100 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                        💰 Sem custos extras:
                      </h4>
                      <ul className="space-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <li>• Seguro já incluído no frete</li>
                        <li>• Reembolso integral em caso de sinistro</li>
                        <li>• Processo simplificado</li>
                        <li>• Suporte total durante a ocorrência</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Como Funciona a Entrega */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Como Funciona a Entrega
            </h2>
            
            <div className="space-y-6">
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                  📋 Políticas das Transportadoras
                </h3>
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  A entrega segue as <strong>políticas específicas de cada transportadora</strong>, 
                  garantindo que você receba seus produtos conforme as melhores práticas logísticas.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                      🏠 Entrega Residencial/Comercial:
                    </h4>
                    <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--red)' }}></span>
                        <span>Tentativas conforme política da transportadora</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--red)' }}></span>
                        <span>Horário comercial (8h às 17h)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--red)' }}></span>
                        <span>Necessário responsável para recebimento</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                      📱 Acompanhamento:
                    </h4>
                    <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--red)' }}></span>
                        <span>Código de rastreamento fornecido</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--red)' }}></span>
                        <span>Atualizações em tempo real</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--red)' }}></span>
                        <span>Suporte via WhatsApp</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Grandes Volumes */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Pedidos de Grande Volume
            </h2>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                📦 Transportadoras Especializadas
              </h3>
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Para pedidos de grande volume, utilizamos <strong>transportadoras especializadas</strong> 
                como Braspress e Rodonaves, que oferecem condições especiais para cargas maiores.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                    🚛 Vantagens para Grandes Volumes:
                  </h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--purple)' }}></span>
                      <span>Frete otimizado por volume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--purple)' }}></span>
                      <span>Entrega direta no endereço</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--purple)' }}></span>
                      <span>Agendamento de entrega</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--purple)' }}></span>
                      <span>Seguro completo incluído</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-purple-100 rounded-lg p-4">
                  <h4 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                    💬 Consulte-nos:
                  </h4>
                  <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                    Para pedidos com grande quantidade, entre em contato para 
                    negociarmos as melhores condições de frete.
                  </p>
                  <button
                    onClick={() => {
                      const message = encodeURIComponent('Olá! Gostaria de consultar condições especiais de frete para grande volume.')
                      window.open(`https://wa.me/5511911304693?text=${message}`, '_blank')
                    }}
                    className="text-xs bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors"
                  >
                    Consultar pelo WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Resumo da Política */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--foreground)' }}>
              📋 Resumo da Política
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                    ✅ Garantimos
                  </h4>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <li>• Múltiplas opções de transportadoras</li>
                    <li>• Seguro incluso sem custo extra</li>
                    <li>• Rastreamento completo</li>
                    <li>• Embalagem segura e cuidadosa</li>
                    <li>• Entrega em todo território nacional</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                    ⏰ Prazos
                  </h4>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <li>• Estado de São Paulo: 1-2 dias úteis</li>
                    <li>• Sudeste e Centro-Oeste: 2-4 dias úteis</li>
                    <li>• Norte e Nordeste: 5-9 dias úteis</li>
                    <li>• Separação: até 24h úteis</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                    💰 Cálculo
                  </h4>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <li>• Baseado em peso + volume + CEP</li>
                    <li>• Cálculo automático pelo catálogo</li>
                    <li>• Melhor preço entre transportadoras</li>
                    <li>• Condições especiais para grandes volumes</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                    🚀 Flexibilidade
                  </h4>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <li>• Você escolhe a transportadora</li>
                    <li>• Coleta por transportadora preferencial</li>
                    <li>• Suporte durante todo o processo</li>
                    <li>• Soluções personalizadas</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Final */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                🚚 Dúvidas sobre Frete e Entrega?
              </h2>
              <p className="text-base mb-6 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                Nossa equipe está pronta para esclarecer qualquer dúvida sobre frete, prazos 
                e condições de entrega. Entre em contato e receba atendimento personalizado!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const message = encodeURIComponent('Olá! Gostaria de saber mais sobre frete e prazos de entrega.')
                    window.open(`https://wa.me/5511911304693?text=${message}`, '_blank')
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  Consultar Frete via WhatsApp
                </button>
                <a
                  href="/fale-conosco"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Outros Contatos
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