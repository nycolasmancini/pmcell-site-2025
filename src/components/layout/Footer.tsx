'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sobre Nós */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sobre Nós</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre-nos" className="text-gray-300 hover:text-white transition-colors">
                  Nossa História
                </Link>
              </li>
            </ul>
          </div>

          {/* Políticas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Políticas</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/politica-privacidade" className="text-gray-300 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-condicoes" className="text-gray-300 hover:text-white transition-colors">
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link href="/politica-trocas" className="text-gray-300 hover:text-white transition-colors">
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link href="/politica-frete" className="text-gray-300 hover:text-white transition-colors">
                  Frete e Entrega
                </Link>
              </li>
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Atendimento</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/fale-conosco" className="text-gray-300 hover:text-white transition-colors">
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Compras */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Como Comprar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/como-comprar" className="text-gray-300 hover:text-white transition-colors">
                  Guia de Compra
                </Link>
              </li>
              <li>
                <Link href="/formas-pagamento" className="text-gray-300 hover:text-white transition-colors">
                  Formas de Pagamento
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha separadora */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col items-center text-center space-y-2">
            <p className="text-gray-400 text-sm">
              © 2025 PMCELL São Paulo. Todos os direitos reservados.
            </p>
            <p className="text-gray-400 text-sm">
              CNPJ: 29.734.462/0003-86
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}