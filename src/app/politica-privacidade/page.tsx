'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header showSearchBar={false} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="card p-6 animate-slide-up">
          {/* Header da Página */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Política de Privacidade
            </h1>
            <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
              Como coletamos, usamos e protegemos suas informações pessoais
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
              Última atualização: Janeiro de 2025
            </p>
          </div>

          {/* Introdução */}
          <section className="mb-6">
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
              A PMCELL São Paulo, localizada na Rua Comendador Abdo Schahin, 62 - Loja 4, 
              25 de Março, São Paulo - SP, valoriza e respeita a privacidade de seus clientes. 
              Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e 
              protegemos suas informações pessoais, em conformidade com a Lei Geral de Proteção 
              de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          {/* Seção 1 - Informações Coletadas */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              1. Informações que Coletamos
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                  Dados Pessoais Coletados:
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--blue)', aspectRatio: '1' }}></span>
                    <span><strong>Nome completo:</strong> Para identificação e comunicação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--blue)', aspectRatio: '1' }}></span>
                    <span><strong>Número de telefone:</strong> Para contato direto via WhatsApp</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                  Como Coletamos seus Dados:
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)', aspectRatio: '1' }}></span>
                    <span><strong>WhatsApp:</strong> Quando você entra em contato conosco</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--green)', aspectRatio: '1' }}></span>
                    <span><strong>Formulários online:</strong> Cadastro no site e solicitações</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Seção 2 - Finalidades */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              2. Como Utilizamos suas Informações
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-lg p-4">
                <div>
                  <div>
                    <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                      Processamento de Pedidos
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Identificar e processar seus pedidos de acessórios para celular
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div>
                  <div>
                    <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                      Comunicação
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Entrar em contato sobre pedidos, dúvidas e suporte ao cliente
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div>
                  <div>
                    <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                      Marketing e Promoções
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Enviar ofertas especiais, novidades e promoções exclusivas
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div>
                  <div>
                    <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                      Melhoria do Atendimento
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Aprimorar nossos serviços e experiência do cliente
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 3 - Compartilhamento */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              3. Compartilhamento de Dados
            </h2>
            
            <div className="bg-green-50 rounded-lg p-6">
              <div>
                <div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    Compromisso de Confidencialidade
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    <strong>NÃO compartilhamos seus dados pessoais com terceiros.</strong> Suas informações 
                    são utilizadas exclusivamente pela PMCELL São Paulo para as finalidades descritas 
                    nesta política. Mantemos total confidencialidade e segurança de seus dados.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 4 - Armazenamento */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              4. Armazenamento e Retenção de Dados
            </h2>
            
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                  Período de Armazenamento
                </h3>
                <p className="text-base leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                  Seus dados são armazenados <strong>permanentemente</strong> em nossos sistemas para:
                </p>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--purple)', aspectRatio: '1' }}></span>
                    <span>Manter histórico de relacionamento comercial</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--purple)', aspectRatio: '1' }}></span>
                    <span>Facilitar futuros atendimentos e pedidos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--purple)', aspectRatio: '1' }}></span>
                    <span>Cumprir obrigações legais e fiscais</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border-l-4" style={{ borderColor: 'var(--orange)' }}>
                <h4 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                  💡 Importante:
                </h4>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Você pode solicitar a exclusão de seus dados a qualquer momento exercendo seus direitos 
                  previstos na LGPD, conforme descrito na seção "Seus Direitos".
                </p>
              </div>
            </div>
          </section>

          {/* Seção 5 - Segurança */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              5. Segurança dos Dados
            </h2>
            
            <div className="bg-red-50 rounded-lg p-6">
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger 
                seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição, 
                incluindo:
              </p>
              <ul className="grid md:grid-cols-2 gap-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--red)', aspectRatio: '1' }}></span>
                  <span>Acesso restrito aos dados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--red)', aspectRatio: '1' }}></span>
                  <span>Sistemas seguros de armazenamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--red)', aspectRatio: '1' }}></span>
                  <span>Treinamento de funcionários</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--red)', aspectRatio: '1' }}></span>
                  <span>Monitoramento constante</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Seção 6 - Direitos */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              6. Seus Direitos (LGPD)
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                    Acesso aos Dados
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Saber quais dados seus temos e como os utilizamos
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                    Correção de Dados
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Solicitar correção de informações incompletas ou incorretas
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                    Exclusão de Dados
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Solicitar a eliminação de seus dados pessoais
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                    Portabilidade
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Receber seus dados em formato estruturado
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                    Oposição ao Tratamento
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Opor-se ao uso de seus dados para determinadas finalidades
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                    Revogação do Consentimento
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Retirar consentimento a qualquer momento
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 7 - Contato */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              7. Contato para Questões de Privacidade
            </h2>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                Para exercer seus direitos, esclarecer dúvidas sobre esta política ou reportar 
                incidentes de segurança, entre em contato conosco:
              </p>
              <div className="space-y-4">
                <div>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                    Rua Comendador Abdo Schahin, 62 - Loja 4
                  </p>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    25 de Março, São Paulo - SP
                  </p>
                </div>
                
                <div>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                    E-mail: nycolas@pmcellsaopaulo.com.br
                  </p>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Responsável: Nycolas Mancini
                  </p>
                </div>
                
                <div>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                    WhatsApp: (11) 97459-4169
                  </p>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Atendimento para questões de privacidade
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 8 - Alterações */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                Alterações nesta Política
              </h2>
              <p className="text-base leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                Esta Política de Privacidade pode ser atualizada periodicamente para refletir 
                mudanças em nossas práticas ou na legislação. Recomendamos revisar esta página 
                regularmente. A data da última atualização está indicada no início deste documento.
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}