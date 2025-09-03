'use client'

import { TodosProdutosIcon } from './Icons'

interface EndOfCategoryCardProps {
  onOpenMenu: () => void
}

export function EndOfCategoryCard({ onOpenMenu }: EndOfCategoryCardProps) {
  return (
    <div className="col-span-full mt-8">
      <div className="card p-8 text-center animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center mb-6" style={{ color: 'var(--orange)' }}>
          <div className="relative">
            <TodosProdutosIcon size={48} />
            {/* Decorative elements */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
          Explore mais categorias!
        </h3>

        {/* Description */}
        <p className="text-base mb-6 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          Descubra nossa linha completa de acessórios para celular. 
          Temos muito mais produtos esperando por você!
        </p>

        {/* Call to Action Button */}
        <button
          onClick={onOpenMenu}
          className="btn-primary interactive px-8 py-3 text-base font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
          style={{ 
            background: 'var(--orange)', 
            color: 'var(--surface)',
            boxShadow: '0 4px 12px rgba(252, 109, 54, 0.3)'
          }}
        >
          <TodosProdutosIcon size={20} />
          Ver Outras Categorias
        </button>

        {/* Subtitle */}
        <p className="text-sm mt-4 opacity-75" style={{ color: 'var(--muted-foreground)' }}>
          Mais de 10 categorias diferentes disponíveis
        </p>
      </div>
    </div>
  )
}