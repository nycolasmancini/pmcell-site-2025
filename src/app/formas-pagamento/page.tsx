'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function FormasPagamento() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header showSearchBar={false} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="card p-6 animate-slide-up">
          {/* Header da Página */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Formas de Pagamento
            </h1>
            <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
              Escolha a forma de pagamento que melhor se adequa ao seu negócio
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
              Segurança e praticidade para seus pedidos atacadistas
            </p>
          </div>

          {/* PIX em Destaque */}
          <section className="mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                    💚 PIX - Nossa Recomendação
                  </h2>
                  <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                    <strong>Pagamento instantâneo com os melhores preços!</strong> Ao pagar via PIX, 
                    você garante os valores exatos do catálogo, sem acréscimos ou taxas adicionais.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                        ⚡ Vantagens do PIX
                      </h4>
                      <ul className="space-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <li>• Valores do catálogo (sem juros)</li>
                        <li>• Pagamento instantâneo</li>
                        <li>• Liberação rápida do pedido</li>
                        <li>• Disponível 24h</li>
                      </ul>
                    </div>
                    <div className="bg-green-100 rounded-lg p-4">
                      <h4 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                        📱 Como Funciona
                      </h4>
                      <ul className="space-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <li>• Enviamos QR Code ou chave PIX</li>
                        <li>• Você paga pelo app do banco</li>
                        <li>• Confirmação automática</li>
                        <li>• Pedido separado em até 24h</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cartão de Crédito */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              Cartão de Crédito
            </h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--foreground)' }}>
                      💳 Parcelamento via InfinitePay
                    </h3>
                    <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                      Parcelamos seus pedidos em <strong>até 12x com juros</strong>, utilizando a plataforma 
                      InfinitePay para máxima segurança e confiabilidade.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                          🏦 Bandeiras Aceitas
                        </h4>
                        <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          <p className="mb-2">Todas as principais bandeiras:</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">Visa</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">Mastercard</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">American Express</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">Elo</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">Hipercard</span>
                          </div>
                          <p className="text-xs mt-2">*Conforme aceitas pela InfinitePay</p>
                        </div>
                      </div>
                      <div className="bg-blue-100 rounded-lg p-4">
                        <h4 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                          📊 Exemplo de Parcelamento
                        </h4>
                        <div className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          <div className="flex justify-between">
                            <span>À vista (PIX):</span>
                            <span className="font-medium">R$ 1.000,00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>6x no cartão:</span>
                            <span className="font-medium">6x R$ 180,00*</span>
                          </div>
                          <div className="flex justify-between">
                            <span>12x no cartão:</span>
                            <span className="font-medium">12x R$ 95,00*</span>
                          </div>
                          <p className="text-xs mt-2">*Valores simulados com juros</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pagamento em Dinheiro */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              Pagamento Presencial
            </h2>
            
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--foreground)' }}>
                    💵 Dinheiro na Loja Física
                  </h3>
                  <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                    Você pode pagar em <strong>dinheiro diretamente na loja</strong> e retirar seus produtos 
                    na hora. Ideal para quem está na região da 25 de Março!
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                      🏪 Informações da Loja
                    </h4>
                    <div className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <p><strong>Endereço:</strong> Rua Comendador Abdo Schahin, 62 - Loja 4</p>
                      <p><strong>Bairro:</strong> Centro, São Paulo - SP</p>
                      <p><strong>Horário:</strong> Segunda a Sexta, 8h às 17h</p>
                      <p><strong>Vantagem:</strong> Retirada imediata + Valores do catálogo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Processo de Pagamento */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              Como Funciona o Processo
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: '#6B21A8' }}>
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                        Faça seu Pedido
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Entre em contato via WhatsApp com a lista de produtos desejados
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: '#3B82F6' }}>
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                        Escolha a Forma
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Selecione: PIX, cartão parcelado ou pagamento presencial
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: '#10B981' }}>
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                        Realize o Pagamento
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Pague via PIX, cartão na InfinitePay ou pessoalmente na loja
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: '#F97316' }}>
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                        Confirmação Automática
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Assim que aprovado, seu pedido entra na fila de separação
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: '#C2410C' }}>
                      5
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                        Preparação Rápida
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Separamos e embalamos seu pedido em até 24 horas úteis
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: '#374151' }}>
                      6
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                        Código de Rastreamento
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Enviamos a etiqueta de rastreio para acompanhar a entrega
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Informações Importantes */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--foreground)' }}>
              📋 Informações Importantes
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  ✅ Vantagens
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <li>• <strong>Sem limite</strong> mínimo ou máximo de valor</li>
                  <li>• <strong>Aprovação rápida</strong> do pagamento</li>
                  <li>• <strong>Envio em até 24h úteis</strong> após aprovação</li>
                  <li>• <strong>Nota fiscal</strong> em todas as vendas</li>
                  <li>• <strong>Rastreamento completo</strong> do pedido</li>
                  <li>• <strong>Suporte total</strong> durante o processo</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  🔒 Segurança
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <li>• <strong>InfinitePay</strong> - plataforma confiável</li>
                  <li>• <strong>PIX seguro</strong> via chave cadastrada</li>
                  <li>• <strong>Ambiente protegido</strong> para pagamentos</li>
                  <li>• <strong>Dados criptografados</strong> e seguros</li>
                  <li>• <strong>Confirmação automática</strong> de recebimento</li>
                  <li>• <strong>Comprovantes oficiais</strong> de pagamento</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                Pronto para Fazer seu Pedido?
              </h2>
              <p className="text-base mb-6 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                Entre em contato conosco via WhatsApp e escolha a forma de pagamento que melhor se 
                adequa ao seu negócio. Nosso time está pronto para ajudar!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const message = encodeURIComponent('Olá! Gostaria de fazer um pedido e saber sobre as formas de pagamento.')
                    window.open(`https://wa.me/5511911304693?text=${message}`, '_blank')
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  Fazer Pedido via WhatsApp
                </button>
                <button
                  onClick={() => {
                    const message = encodeURIComponent('Olá! Gostaria de agendar uma videochamada para ver os produtos.')
                    window.open(`https://wa.me/5511983266609?text=${message}`, '_blank')
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Videochamada dos Produtos
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}