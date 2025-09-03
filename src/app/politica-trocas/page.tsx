'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PoliticaTrocas() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header showSearchBar={false} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="card p-6 animate-slide-up">
          {/* Header da Página */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Política de Trocas e Devoluções
            </h1>
            <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
              Condições para trocas, devoluções e garantia dos produtos
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
              Última atualização: Janeiro de 2025
            </p>
          </div>

          {/* Garantia - Destaque */}
          <section className="mb-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
              <div>
                <div>
                  <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                    🛡️ Garantia de 3 Meses
                  </h2>
                  <p className="text-lg leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    <strong>Todos os produtos da PMCELL São Paulo</strong> possuem garantia de <strong>90 dias (3 meses)</strong> 
                    contra defeitos de fabricação. Sua tranquilidade é nossa prioridade!
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 1 - Condições para Troca */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              1. Quando Aceitamos Trocas
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--foreground)' }}>
                  ✅ Situações Aceitas para Troca
                </h3>
                <ul className="space-y-3 text-base" style={{ color: 'var(--muted-foreground)' }}>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                    <span><strong>Defeitos de fabricação:</strong> Produtos que apresentam problemas de qualidade</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                    <span><strong>Produto com defeito:</strong> Não funciona corretamente desde o recebimento</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                    <span><strong>Produto diferente:</strong> Item recebido não confere com o pedido</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                    <span><strong>Problemas de qualidade:</strong> Falhas evidentes na fabricação</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--foreground)' }}>
                  ❌ NÃO Aceitamos Trocas
                </h3>
                <ul className="space-y-3 text-base" style={{ color: 'var(--muted-foreground)' }}>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--red)' }}></span>
                    <span><strong>Produtos sujos:</strong> Itens que apresentem sujeira ou marcas de uso</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--red)' }}></span>
                    <span><strong>Produtos riscados:</strong> Acessórios com riscos ou danos visíveis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--red)' }}></span>
                    <span><strong>Embalagem danificada:</strong> Produtos sem embalagem original em bom estado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--red)' }}></span>
                    <span><strong>Desistência simples:</strong> Mudança de ideia sem defeito no produto</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Seção 2 - Prazos */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              2. Prazos e Flexibilidade
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-orange-50 rounded-lg p-6">
                <div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                      📅 Prazo para Solicitar
                    </h3>
                    <p className="text-base mb-2" style={{ color: 'var(--muted-foreground)' }}>
                      Você tem <strong>90 dias</strong> para solicitar a troca
                    </p>
                    <div className="bg-orange-100 rounded-md px-3 py-1 inline-block">
                      <span className="text-xs font-medium text-orange-800">Até 3 meses</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                      📦 Envio Flexível
                    </h3>
                    <p className="text-base mb-2" style={{ color: 'var(--muted-foreground)' }}>
                      Após aprovação, envie quando for conveniente para você
                    </p>
                    <div className="bg-blue-100 rounded-md px-3 py-1 inline-block">
                      <span className="text-xs font-medium text-blue-800">Sem pressa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 rounded-lg p-4 border-l-4" style={{ borderColor: 'var(--orange)' }}>
              <h4 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                💡 Flexibilidade Total
              </h4>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Entendemos que nem sempre é possível enviar o produto imediatamente. Por isso, 
                após aprovada a troca, você pode nos enviar o produto quando for mais conveniente!
              </p>
            </div>
          </section>

          {/* Seção 3 - Processo de Troca */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              3. Como Funciona o Processo
            </h2>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-md flex items-center justify-center text-white font-bold text-sm" style={{ background: '#6b46c1', width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', flexShrink: 0 }}>
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                        Entre em Contato
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Informe o problema via WhatsApp ou na loja física
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-md flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--green)', width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', flexShrink: 0 }}>
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                        Análise do Caso
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Avaliamos sua solicitação e aprovamos a troca
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-md flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--blue)', width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', flexShrink: 0 }}>
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                        Envio do Produto
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Você nos envia o produto quando for conveniente
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-md flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--orange)', width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', flexShrink: 0 }}>
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                        Crédito Gerado
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Geramos crédito para seu próximo pedido
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 4 - Custos de Frete */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              4. Custos de Frete
            </h2>
            
            <div className="bg-red-50 rounded-lg p-6">
              <div>
                <div>
                  <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--foreground)' }}>
                    📋 Política de Frete para Trocas
                  </h3>
                  <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                    <strong>O cliente é responsável pelos custos de frete</strong> para envio do produto 
                    de volta à nossa loja. Não arcamos com despesas de transporte para devoluções.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <strong>💡 Dica:</strong> Considere levar o produto pessoalmente em nossa loja física 
                      na 25 de Março para economizar no frete de devolução.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 5 - Sistema de Crédito */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              5. Sistema de Crédito
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-6">
                <div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--foreground)' }}>
                      💳 Como Funciona o Crédito
                    </h3>
                    <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                      Após recebermos e aprovarmos a devolução, <strong>geramos um crédito no valor 
                      do produto</strong> para ser utilizado em seu próximo pedido.
                    </p>
                    <ul className="space-y-2 text-base" style={{ color: 'var(--muted-foreground)' }}>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                        <span>Crédito equivalente ao valor pago pelo produto</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                        <span>Pode ser usado para comprar qualquer produto</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                        <span><strong>Pode ser usado para abater custos de frete</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                        <span>Sem prazo de validade</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border-l-4" style={{ borderColor: 'var(--blue)' }}>
                <h4 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                  🎯 Vantagem Especial
                </h4>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  O crédito gerado também pode ser utilizado para abater os custos de frete do 
                  seu próximo pedido, oferecendo ainda mais flexibilidade para você!
                </p>
              </div>
            </div>
          </section>

          {/* Seção 6 - Contato para Trocas */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              6. Como Solicitar Troca
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6">
                <div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                      💬 Via WhatsApp
                    </h3>
                    <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      Atendimento rápido e personalizado para sua solicitação de troca
                    </p>
                    <div className="bg-green-100 rounded-md px-3 py-1 inline-block">
                      <span className="text-xs font-medium text-green-800">Mais Prático</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                      🏪 Loja Física
                    </h3>
                    <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      Visite nossa loja na 25 de Março para atendimento presencial
                    </p>
                    <div className="bg-blue-100 rounded-md px-3 py-1 inline-block">
                      <span className="text-xs font-medium text-blue-800">Sem Frete</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Informações Importantes */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 border-2 border-orange-200">
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                📋 Informações Importantes
              </h2>
              <div className="max-w-3xl mx-auto space-y-3 text-base" style={{ color: 'var(--muted-foreground)' }}>
                <p>
                  • <strong>Produtos devem estar em perfeito estado</strong> para serem aceitos na troca
                </p>
                <p>
                  • <strong>Mantenha a embalagem original</strong> sempre que possível
                </p>
                <p>
                  • <strong>Documentação:</strong> Informe número do pedido ou dados da compra
                </p>
                <p>
                  • <strong>Análise individual:</strong> Cada caso será avaliado criteriosamente
                </p>
                <p className="text-lg font-semibold pt-2" style={{ color: 'var(--foreground)' }}>
                  Nossa prioridade é sua satisfação e confiança! 🤝
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}