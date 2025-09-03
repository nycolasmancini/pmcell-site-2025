"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Tag, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"


interface Category {
  id: string
  name: string
  slug: string
  productCount?: number
}


export function Sidebar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  
  useEffect(() => {
    fetchCategories()
  }, [])
  
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      
      // Mapear os dados da API para o formato esperado pelo componente
      const mappedCategories = data.map((category: any) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        productCount: category._count?.products || 0
      }))
      
      setCategories(mappedCategories)
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20 space-y-4">
        {/* Título */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="flex items-center text-lg font-semibold text-gray-900">
            <Package className="mr-2 h-5 w-5 text-[#FC6D36]" />
            Categorias
          </h2>
        </div>
        
        {/* Lista de Categorias */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-4">
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <nav className="p-2">
              
              {/* Link para Kits */}
              <Link
                href="/kits"
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 ease-out transform hover:scale-[1.02] mt-1",
                  pathname === "/kits"
                    ? "bg-[#FC6D36] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <span className="flex items-center">
                  Kits Promocionais
                </span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              
              <div className="my-2 border-t border-gray-200" />
              
              {/* Categorias */}
              {categories.map((category) => {
                const isActive = pathname === `/categoria/${category.slug}`
                return (
                  <Link
                    key={category.id}
                    href={`/categoria/${category.slug}`}
                    className={cn(
                      "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 ease-out transform hover:scale-[1.02]",
                      isActive
                        ? "bg-[#FC6D36] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <span className="flex items-center">
                      <span>{category.name}</span>
                    </span>
                    {category.productCount && category.productCount > 0 && (
                      <span className={cn(
                        "text-xs transition-colors duration-300 ease-out",
                        isActive
                          ? "text-white/80"
                          : "text-gray-500"
                      )}>
                        {category.productCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>
        
        {/* Banner promocional */}
        <div className="bg-gradient-to-br from-[#FC6D36] to-[#ff8c5a] rounded-lg p-4 text-white">
          <h3 className="font-semibold mb-2">Compre no Atacado</h3>
          <p className="text-sm text-white/90 mb-3">
            Preços especiais para grandes quantidades!
          </p>
          <Link
            href="/kits"
            className="inline-flex items-center text-sm font-medium bg-white text-[#FC6D36] px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            Ver Kits
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </aside>
  )
}