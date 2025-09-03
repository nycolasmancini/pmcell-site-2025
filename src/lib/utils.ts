import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatPrice(value: number): string {
  return formatCurrency(value)
}

export function formatWhatsApp(phone: string): string {
  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, '')
  
  // Adiciona o 55 se não tiver
  const withCountry = numbers.startsWith('55') ? numbers : `55${numbers}`
  
  // Adiciona o 9 após o DDD se necessário (para celulares)
  const ddd = withCountry.substring(2, 4)
  const phoneNumber = withCountry.substring(4)
  
  // Se o número tem 8 dígitos e é celular (começa com 9, 8, 7, 6), adiciona o 9
  if (phoneNumber.length === 8 && ['9', '8', '7', '6'].includes(phoneNumber[0])) {
    return `55${ddd}9${phoneNumber}`
  }
  
  return withCountry
}

export function validateWhatsApp(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  // Aceita números com 10 ou 11 dígitos (com ou sem o 9)
  return cleaned.length === 10 || cleaned.length === 11 || 
         cleaned.length === 12 || cleaned.length === 13 // Com código do país
}

export function validateBrazilianWhatsApp(phone: string): boolean {
  const clean = phone.replace(/\D/g, '')
  // Aceita números brasileiros com 10 ou 11 dígitos (com ou sem código do país)
  if (clean.length === 10 || clean.length === 11) {
    // Número sem código do país: valida se tem DDD válido (11-99)
    const ddd = clean.substring(0, 2)
    return parseInt(ddd) >= 11 && parseInt(ddd) <= 99
  }
  // Deve começar com 55 e ter 12 ou 13 dígitos (com código do país)
  return /^55\d{10,11}$/.test(clean)
}

export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  
  return `${year}${month}${day}${random}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Sanitizar URL de imagem removendo parâmetros problemáticos
 */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  
  // Para URLs base64, retornar como está
  if (url.startsWith('data:')) {
    return url
  }
  
  // Para URLs do Cloudinary, remover parâmetros de query problemáticos
  if (url.includes('cloudinary.com')) {
    return url.split('?')[0]
  }
  
  return url
}