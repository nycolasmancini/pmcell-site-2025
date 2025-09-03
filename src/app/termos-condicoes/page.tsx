'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function TermosCondicoes() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header showSearchBar={false} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="card p-6 animate-slide-up">
          {/* Header da Página */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Termos e Condições de Uso
            </h1>
            <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
              Regras e condições para compras na PMCELL São Paulo
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
              Última atualização: Janeiro de 2025
            </p>
          </div>

          {/* Introdução */}
          <section className="mb-6">
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Bem-vindo à PMCELL São Paulo! Estes Termos e Condições de Uso estabelecem as regras 
              para utilização de nossos serviços e realização de compras. Ao utilizar nossos serviços, 
              você concorda com todos os termos descritos neste documento.
            </p>
          </section>

          {/* Seção 1 - Pedido Mínimo */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              1. Pedido Mínimo
            </h2>
            
            <div className="bg-orange-50 rounded-lg p-6">
              <div>
                <div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    Quantidade Mínima: 30 Peças
                  </h3>
                  <p className="text-base leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                    O pedido mínimo para compras é de <strong>30 peças no total</strong>, podendo ser 
                    uma combinação de diferentes produtos. Não é necessário comprar 30 unidades do 
                    mesmo produto.
                  </p>
                  <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: 'var(--orange)' }}>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <strong>Exemplo:</strong> Você pode comprar 10 capas + 15 películas + 5 fones = 30 peças ✅
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 2 - Formas de Pagamento */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              2. Formas de Pagamento
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6">
                <div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                      PIX
                    </h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                      Pagamento instantâneo via PIX
                    </p>
                    <div className="bg-green-100 rounded-md px-3 py-1 inline-block">
                      <span className="text-xs font-medium text-green-800">Recomendado</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                      Cartão de Crédito
                    </h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                      Parcelamento em até 12x com juros
                    </p>
                    <div className="bg-blue-100 rounded-md px-3 py-1 inline-block">
                      <span className="text-xs font-medium text-blue-800">Até 12x</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 3 - Política de Preços */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              3. Política de Preços
            </h2>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 rounded-lg p-6 border-l-4" style={{ borderColor: 'var(--orange)' }}>
                <div>
                  <div>
                    <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                      ⚠️ Preços Sujeitos a Alteração
                    </h3>
                    <p className="text-base leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      Os preços exibidos em nosso site e catálogos <strong>podem ser alterados sem aviso prévio</strong>. 
                      Garantimos os valores apenas para pedidos que já foram pagos.
                    </p>
                    <div className="bg-orange-100 rounded-lg p-3">
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        📋 Importante: Confirme sempre os preços antes de finalizar seu pedido.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-3" style={{ color: 'var(--foreground)' }}>
                  ✅ Garantia de Preços
                </h4>
                <ul className="space-y-2 text-base" style={{ color: 'var(--muted-foreground)' }}>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                    <span>Pedidos <strong>pagos</strong>: preços garantidos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)' }}></span>
                    <span>Pedidos <strong>não pagos</strong>: sujeitos a alteração</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Seção 4 - Cobertura de Entrega */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              4. Cobertura de Entrega
            </h2>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <div>
                <div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    🇧🇷 Entregamos para Todo o Brasil
                  </h3>
                  <p className="text-base leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                    Realizamos entregas para <strong>todas as regiões do Brasil</strong>, utilizando 
                    transportadoras confiáveis e sistemas de logística eficientes.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="font-medium" style={{ color: 'var(--foreground)' }}>Norte</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="font-medium" style={{ color: 'var(--foreground)' }}>Nordeste</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="font-medium" style={{ color: 'var(--foreground)' }}>Centro-Oeste</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="font-medium" style={{ color: 'var(--foreground)' }}>Sudeste</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="font-medium" style={{ color: 'var(--foreground)' }}>Sul</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 5 - Restrições de Idade */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              5. Política de Idade
            </h2>
            
            <div className="bg-green-50 rounded-lg p-6">
              <div>
                <div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    ✅ Sem Restrições de Idade
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    <strong>Não há restrições de idade</strong> para realizar compras na PMCELL São Paulo. 
                    Nossos produtos são acessórios para dispositivos móveis, adequados para todas as idades.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 6 - Responsabilidades */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              6. Responsabilidades do Cliente
            </h2>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <div>
                <div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    ✅ Processo Simplificado
                  </h3>
                  <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                    <strong>Não há responsabilidades especiais</strong> por parte do cliente além das 
                    práticas comerciais normais. Nosso processo de compra é simples e direto.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-base mb-3" style={{ color: 'var(--foreground)' }}>
                      📝 O que esperamos do cliente:
                    </h4>
                    <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--purple)' }}></span>
                        <span>Fornecer informações corretas para contato e entrega</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--purple)' }}></span>
                        <span>Realizar o pagamento conforme combinado</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--purple)' }}></span>
                        <span>Comunicar qualquer problema ou dúvida</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 7 - Disponibilidade de Produtos */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              7. Disponibilidade de Produtos
            </h2>
            
            <div className="bg-red-50 rounded-lg p-6">
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Nos esforçamos para manter nosso estoque sempre atualizado, porém a disponibilidade 
                dos produtos pode variar. Em caso de indisponibilidade, entraremos em contato para 
                oferecer alternativas ou reembolso.
              </p>
            </div>
          </section>

          {/* Seção 8 - Modificações dos Termos */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              8. Modificações destes Termos
            </h2>
            
            <div className="bg-orange-50 rounded-lg p-6">
              <p className="text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                A PMCELL São Paulo reserva-se o direito de modificar estes Termos e Condições 
                a qualquer momento. As alterações entrarão em vigor imediatamente após sua 
                publicação. Recomendamos revisar periodicamente este documento.
              </p>
            </div>
          </section>

          {/* Contato */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                Dúvidas sobre os Termos?
              </h2>
              <p className="text-base leading-relaxed max-w-3xl mx-auto mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Se você tiver qualquer dúvida sobre estes Termos e Condições de Uso, 
                entre em contato conosco. Estamos aqui para ajudar!
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-center">
                  <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                    📱 WhatsApp: (11) 97459-4169
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <p className="font-medium text-sm break-all" style={{ color: 'var(--foreground)' }}>
                    📧 E-mail: nycolas@pmcellsaopaulo.com.br
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                  📍 Rua Comendador Abdo Schahin, 62 - Loja 4, 25 de Março, São Paulo - SP
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