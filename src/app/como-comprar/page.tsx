'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function ComoComprar() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header showSearchBar={false} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="card p-6 animate-slide-up">
          {/* Header da Página */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Como Comprar
            </h1>
            <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
              Guia completo para fazer seu primeiro pedido na PMCELL São Paulo
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
              Processo simples e rápido em poucos passos
            </p>
          </div>

          {/* Processo Passo a Passo */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-6 text-center" style={{ color: 'var(--foreground)' }}>
              📋 Passo a Passo Completo
            </h2>
            
            <div className="space-y-6">
              {/* Passo 1 */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-l-4" style={{ borderColor: 'var(--blue)' }}>
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                    🌐 Navegue pelo Nosso Catálogo Online
                  </h3>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      <strong>Este site é nosso catálogo oficial!</strong> Navegue pelas categorias, 
                      veja produtos, preços e especificações. Todo o estoque está sempre atualizado.
                    </p>
                    <div className="bg-white rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                        ✨ Dicas para Navegar:
                      </h4>
                      <ul className="space-y-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <li>• Use o filtro por categorias na lateral</li>
                        <li>• Utilize a barra de busca para produtos específicos</li>
                        <li>• Clique em "Liberar Preços" para ver valores de atacado</li>
                        <li>• Anote os produtos e quantidades desejadas</li>
                      </ul>
                    </div>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border-l-4" style={{ borderColor: 'var(--green)' }}>
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                    💬 Entre em Contato via WhatsApp
                  </h3>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      Após escolher os produtos, <strong>entre em contato via WhatsApp</strong> com nossa equipe. 
                      Envie a lista dos produtos e quantidades desejadas.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                          📱 WhatsApp 1
                        </h4>
                        <p className="text-lg font-bold text-green-600 mb-2">(11) 91130-4693</p>
                        <button
                          onClick={() => {
                            const message = encodeURIComponent('Olá! Vi os produtos no site e gostaria de fazer um pedido.')
                            window.open(`https://wa.me/5511911304693?text=${message}`, '_blank')
                          }}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                        >
                          Clique para conversar
                        </button>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                          📱 WhatsApp 2
                        </h4>
                        <p className="text-lg font-bold text-green-600 mb-2">(11) 98132-6609</p>
                        <button
                          onClick={() => {
                            const message = encodeURIComponent('Olá! Vi os produtos no site e gostaria de fazer um pedido.')
                            window.open(`https://wa.me/5511983266609?text=${message}`, '_blank')
                          }}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                        >
                          Clique para conversar
                        </button>
                      </div>
                    </div>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border-l-4" style={{ borderColor: 'var(--orange)' }}>
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                    👨‍💼 Atendimento Personalizado
                  </h3>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      <strong>Um de nossos vendedores entrará em contato</strong> via WhatsApp para confirmar 
                      todos os detalhes do seu pedido.
                    </p>
                    <div className="bg-white rounded-lg p-3">
                      <h4 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                        📝 O que o vendedor confirmará:
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--orange)' }}></span>
                            <span>Produtos e quantidades</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--orange)' }}></span>
                            <span>Disponibilidade no estoque</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--orange)' }}></span>
                            <span>Valores finais dos produtos</span>
                          </li>
                        </ul>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--orange)' }}></span>
                            <span>Endereço de entrega completo</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--orange)' }}></span>
                            <span>Cálculo do frete</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--orange)' }}></span>
                            <span>Forma de pagamento preferida</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                </div>
              </div>

              {/* Passo 4 */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border-l-4" style={{ borderColor: 'var(--purple)' }}>
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                    💳 Finalize o Pagamento
                  </h3>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      Com todos os detalhes confirmados, <strong>realize o pagamento</strong> através da 
                      forma escolhida: PIX, cartão parcelado ou dinheiro na loja.
                    </p>
                    <div className="bg-white rounded-lg p-3">
                      <h4 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                        💰 Formas de Pagamento Aceitas:
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: 'var(--green)' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M12 2v20"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                        </div>
                        <p className="text-sm font-medium">PIX</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Instantâneo</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: 'var(--blue)' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                            <line x1="1" y1="10" x2="23" y2="10"/>
                          </svg>
                        </div>
                        <p className="text-sm font-medium">Cartão</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Até 12x</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: 'var(--orange)' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <p className="text-sm font-medium">Dinheiro</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Na loja</p>
                        </div>
                      </div>
                    </div>
                </div>
              </div>

              {/* Passo 5 */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border-l-4" style={{ borderColor: 'var(--red)' }}>
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                    📦 Separação e Envio
                  </h3>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      <strong>Após a aprovação do pagamento</strong>, seu pedido entra imediatamente na fila 
                      de separação. Trabalhamos com agilidade para enviar rapidamente.
                    </p>
                    <div className="bg-white rounded-lg p-3">
                      <h4 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                        🚀 O que acontece após o pagamento:
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                            ⚡ Processo Ágil:
                          </h4>
                          <ul className="space-y-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            <li>• Separação em até 24h úteis</li>
                            <li>• Embalagem cuidadosa</li>
                            <li>• Etiqueta de rastreamento</li>
                            <li>• Envio pela transportadora</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                            📋 Cadastro Automático:
                          </h4>
                          <ul className="space-y-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            <li>• Cadastro criado automaticamente</li>
                            <li>• Histórico de pedidos</li>
                            <li>• Cliente preferencial</li>
                            <li>• Próximas compras mais rápidas</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                </div>
              </div>

              {/* Passo 6 */}
              <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg p-4 border-l-4" style={{ borderColor: 'var(--teal)' }}>
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                    📍 Acompanhe seu Pedido
                  </h3>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      <strong>Receba o código de rastreamento</strong> e acompanhe sua encomenda em tempo real 
                      através do site da transportadora escolhida.
                    </p>
                    <div className="bg-white rounded-lg p-3">
                      <h4 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                        🚚 Formas de Acompanhamento:
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#14B8A6' }}></span>
                            <span>Código via WhatsApp</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#14B8A6' }}></span>
                            <span>Site da transportadora</span>
                          </li>
                        </ul>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#14B8A6' }}></span>
                            <span>App Correios/Transportadora</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#14B8A6' }}></span>
                            <span>Suporte total até entrega</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </section>

          {/* Informações Importantes */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--foreground)' }}>
              ⚠️ Informações Importantes
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-yellow-50 rounded-lg p-6 border-l-4" style={{ borderColor: '#F59E0B' }}>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                    <path d="M12 9v4"/>
                    <path d="M12 17h.01"/>
                    <circle cx="12" cy="12" r="9"/>
                  </svg>
                  📋 Requisitos Mínimos
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}></span>
                    <span><strong>Pedido mínimo:</strong> 30 peças no total</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}></span>
                    <span><strong>Endereço completo:</strong> com CEP para frete</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}></span>
                    <span><strong>WhatsApp ativo:</strong> para comunicação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}></span>
                    <span><strong>Dados pessoais:</strong> nome completo</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6 border-l-4" style={{ borderColor: 'var(--green)' }}>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="9"/>
                  </svg>
                  ✅ Garantias
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                    <span><strong>Produtos originais:</strong> com garantia</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                    <span><strong>Nota fiscal:</strong> sempre incluída</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                    <span><strong>Envio seguro:</strong> com rastreamento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                    <span><strong>Suporte total:</strong> durante todo processo</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Resumo Visual */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--foreground)' }}>
              🚀 Resumo do Processo
            </h2>
            
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
              <div className="flex flex-wrap justify-center items-center gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: 'var(--blue)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <p className="text-xs font-medium">Catálogo</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: 'var(--green)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <p className="text-xs font-medium">WhatsApp</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: 'var(--orange)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <p className="text-xs font-medium">Vendedor</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#8B5CF6' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 2v20"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <p className="text-xs font-medium">Pagamento</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#EF4444' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </div>
                  <p className="text-xs font-medium">Envio</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#14B8A6' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2"/>
                      <path d="M15 18H9"/>
                      <path d="M19 18h2a2 2 0 0 0 2-2v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 17.382 7H14"/>
                      <circle cx="17" cy="18" r="2"/>
                      <circle cx="7" cy="18" r="2"/>
                    </svg>
                  </div>
                  <p className="text-xs font-medium">Recebimento</p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                🎯 Pronto para Começar?
              </h2>
              <p className="text-base mb-6 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                Agora que você sabe como funciona, que tal fazer seu primeiro pedido? Nossa equipe 
                está pronta para atender você com todo carinho e profissionalismo!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const message = encodeURIComponent('Olá! Li o guia "Como Comprar" e gostaria de fazer meu primeiro pedido!')
                    window.open(`https://wa.me/5511911304693?text=${message}`, '_blank')
                  }}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3 text-lg font-semibold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Fazer Primeiro Pedido
                </button>
                <a
                  href="/"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 text-lg font-semibold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  Ver Catálogo
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