import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import OptimizedImage from '@/components/ui/OptimizedImage'

function getClientCount() {
  const baseCount = 3700
  const baseDate = new Date('2025-08-01')
  const currentDate = new Date()
  
  if (currentDate < baseDate) {
    return baseCount
  }
  
  const yearsDiff = currentDate.getFullYear() - baseDate.getFullYear()
  const monthsDiff = currentDate.getMonth() - baseDate.getMonth()
  const totalMonths = yearsDiff * 12 + monthsDiff
  
  return baseCount + (totalMonths * 100)
}

export default function SobreNos() {
  const clientCount = getClientCount()
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header showSearchBar={false} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="card p-6 animate-slide-up">
          {/* Header da Página */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Sobre a PMCELL São Paulo
            </h1>
            <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
              Sua parceira de confiança no atacado de acessórios para celular
            </p>
          </div>

          {/* Nossa História */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Nossa História
            </h2>
            <div className="prose max-w-none">
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Há 5 anos atuando no coração comercial de São Paulo, na tradicional região da 25 de Março, 
                a PMCELL São Paulo se consolidou como distribuidora oficial da importadora PMCELL, oferecendo 
                soluções completas no atacado de acessórios para dispositivos móveis.
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Nossa trajetória começou com o compromisso de fornecer produtos de qualidade com total 
                transparência e confiabilidade. Hoje, atendemos mais de {clientCount.toLocaleString()} clientes em todo o Brasil, 
                combinando a tradição do atendimento presencial com a praticidade das vendas online.
              </p>
            </div>
          </section>

          {/* Localização */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Nossa Localização
            </h2>
            <a 
              href="https://share.google/9z8CDEFDLaa4vOXs3" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-gray-50 rounded-lg overflow-hidden mb-4 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-full h-48 relative">
                <OptimizedImage
                  src="/optimized/pmcell-loja-800.webp"
                  alt="Loja PMCELL na 25 de Março"
                  width={400}
                  height={192}
                  className="w-full h-full object-cover"
                  priority={true}
                  quality={90}
                  sizes="400px"
                />
              </div>
              <div className="p-4 pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                      Loja Física - 25 de Março
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <strong>Rua Comendador Abdo Schahin, 62 - Loja 4</strong><br />
                      25 de Março, São Paulo - SP
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                      Clique para ver no Google Maps • Atendimento presencial
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M7 17l9.2-9.2M17 17V7H7"/>
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          </section>

          {/* Nossos Diferenciais */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Por Que Escolher a PMCELL?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--green)', aspectRatio: '1' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" stroke="white">
                    <path d="M7 12.5L10 15.5L17 8.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    Produtos Originais
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Todos os produtos são originais com código de barras e certificações necessárias
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--blue)', aspectRatio: '1' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" stroke="white">
                    <path d="M6 6L18 6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 10H18" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 14L18 14" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 18L18 18" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 21.4V2.6C2 2.26863 2.26863 2 2.6 2H21.4C21.7314 2 22 2.26863 22 2.6V21.4C22 21.7314 21.7314 22 21.4 22H2.6C2.26863 22 2 21.7314 2 21.4Z" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 18V14H9V18H6Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    Nota Fiscal Garantida
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Todas as vendas acompanham nota fiscal para total segurança do seu negócio
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--orange)', aspectRatio: '1' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" stroke="white">
                    <path d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2475 11.3147 22.2475 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2475 11.3147 22.2475 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41553 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75255 12.6853 1.75255 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41553C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z"/>
                    <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    Garantia de 90 Dias
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Produtos com garantia estendida para sua total tranquilidade
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#8B5CF6', aspectRatio: '1' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" stroke="white">
                    <path d="M8 19C9.10457 19 10 18.1046 10 17C10 15.8954 9.10457 15 8 15C6.89543 15 6 15.8954 6 17C6 18.1046 6.89543 19 8 19Z" strokeMiterlimit="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 19C19.1046 19 20 18.1046 20 17C20 15.8954 19.1046 15 18 15C16.8954 15 16 15.8954 16 17C16 18.1046 16.8954 19 18 19Z" strokeMiterlimit="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.05 17H15V6.6C15 6.26863 14.7314 6 14.4 6H1" strokeLinecap="round"/>
                    <path d="M5.65 17H3.6C3.26863 17 3 16.7314 3 16.4V11.5" strokeLinecap="round"/>
                    <path d="M2 9L6 9" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 9H20.6101C20.8472 9 21.0621 9.13964 21.1584 9.35632L22.9483 13.3836C22.9824 13.4604 23 13.5434 23 13.6273V16.4C23 16.7314 22.7314 17 22.4 17H20.5" strokeLinecap="round"/>
                    <path d="M15 17H16" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    Envios Nacional
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Atendemos todo o Brasil com logística eficiente e segura
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--blue)', aspectRatio: '1' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" stroke="white">
                    <path d="M8.5 11.5L11.5 14.5L16.5 9.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 18L3.13036 4.91253C3.05646 4.39524 3.39389 3.91247 3.90398 3.79912L11.5661 2.09641C11.8519 2.03291 12.1481 2.03291 12.4339 2.09641L20.096 3.79912C20.6061 3.91247 20.9435 4.39524 20.8696 4.91252L19 18C18.9293 18.495 18.5 21.5 12 21.5C5.5 21.5 5.07071 18.495 5 18Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    Certificação ANATEL
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Produtos eletrônicos certificados conforme normas brasileiras
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--green)', aspectRatio: '1' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" stroke="white">
                    <path d="M1 20V19C1 15.134 4.13401 12 8 12V12C11.866 12 15 15.134 15 19V20" strokeLinecap="round"/>
                    <path d="M13 14V14C13 11.2386 15.2386 9 18 9V9C20.7614 9 23 11.2386 23 14V14.5" strokeLinecap="round"/>
                    <path d="M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12Z" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 9C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6C15 7.65685 16.3431 9 18 9Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                    +{clientCount.toLocaleString()} Clientes
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Mais de {clientCount.toLocaleString()} clientes confiam na nossa qualidade e atendimento
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Compromisso */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                Nosso Compromisso
              </h2>
              <p className="text-base leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                Como distribuidora oficial da importadora PMCELL, nosso compromisso é oferecer 
                produtos de qualidade superior, atendimento personalizado e condições comerciais 
                que impulsionem o crescimento do seu negócio. Cada cliente é único, e tratamos 
                cada parceria com o cuidado e atenção que ela merece.
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}