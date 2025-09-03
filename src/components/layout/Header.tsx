"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Menu, X } from "lucide-react"
import { useCartStore } from "@/stores/useCartStore"
import { cn } from "@/lib/utils"

interface HeaderProps {
  searchTerm?: string
  onSearchChange?: (term: string) => void
  onMenuToggle?: () => void
  showMenuButton?: boolean
  onLogoClick?: () => void
  showSearchBar?: boolean
  isMenuOpen?: boolean
}

export function Header({ 
  searchTerm = '', 
  onSearchChange, 
  onMenuToggle, 
  showMenuButton = false,
  onLogoClick,
  showSearchBar = true,
  isMenuOpen = false
}: HeaderProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showSearch, setShowSearch] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)
  
  const itemsCount = useCartStore((state) => state.getItemsCount())
  const toggleCart = useCartStore((state) => state.toggleCart)
  
  // Função para calcular o tamanho da badge baseado no número de dígitos
  const getBadgeSize = (count: number) => {
    const digits = count.toString().length
    if (digits <= 2) return "h-5 w-5 min-w-[20px]" // 1-2 dígitos: círculo
    if (digits === 3) return "h-5 w-7 min-w-[28px]" // 3 dígitos: mais largo
    return "h-5 w-8 min-w-[32px]" // 4+ dígitos: ainda mais largo
  }
  
  // Evitar problemas de hidratação e buscar logo
  useEffect(() => {
    setMounted(true)
    fetchCompanyLogo()
  }, [])

  const fetchCompanyLogo = async () => {
    try {
      const response = await fetch('/api/company-settings')
      if (response.ok) {
        const data = await response.json()
        setLogo(data.logo)
      }
    } catch (error) {
      console.error('Erro ao buscar logo:', error)
    }
  }
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      setIsScrolled(currentScrollY > 10)
      
      // Mobile: esconde busca ao rolar para baixo, mostra ao subir
      if (window.innerWidth < 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setShowSearch(false)
        } else {
          setShowSearch(true)
        }
      }
      
      setLastScrollY(currentScrollY)
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])
  
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white transition-all duration-300 border-t-0",
        isScrolled && "shadow-md"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 text-gray-700" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-700" />
                )}
              </button>
            )}
            
            <Link 
              href="/" 
              className="flex items-center space-x-3"
              onClick={() => onLogoClick?.()}
            >
              {logo && (
                <img 
                  src={logo} 
                  alt="25 de março Store" 
                  className="h-11 w-auto object-contain"
                  onError={() => setLogo(null)}
                />
              )}
              <div className="flex flex-col justify-center">
                <span className="text-2xl font-bold text-black leading-none">25 de março</span>
                <span className="text-sm font-light text-black leading-tight self-end">Store</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Search */}
          {showSearchBar && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm focus:border-[#FC6D36] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Carrinho */}
            <button
              onClick={toggleCart}
              className="relative rounded-lg p-2 hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              {mounted && itemsCount > 0 && (
                <span 
                  className={cn(
                    "absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-[#FC6D36] text-xs font-bold text-white transition-all duration-300 ease-out",
                    getBadgeSize(itemsCount)
                  )}
                >
                  {itemsCount}
                </span>
              )}
            </button>
            
          </div>
        </div>
        
        {/* Mobile Search */}
        {showSearchBar && (
          <div className={cn(
            "md:hidden grid transition-[grid-template-rows] duration-300 ease-in-out",
            showSearch ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}>
            <div className="overflow-hidden">
              <div className="pb-3">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm focus:border-[#FC6D36] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}