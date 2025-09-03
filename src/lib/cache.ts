import { LRUCache } from 'lru-cache'

// Cache em memória com TTL
class MemoryCache {
  private cache: LRUCache<string, any>

  constructor(maxSize = 500, ttl = 1000 * 60 * 30) { // 30 minutos default
    this.cache = new LRUCache({
      max: maxSize,
      ttl: ttl,
      allowStale: false,
      updateAgeOnGet: false,
      updateAgeOnHas: false
    })
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: any, ttl?: number): void {
    if (ttl) {
      this.cache.set(key, value, { ttl })
    } else {
      this.cache.set(key, value)
    }
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  getStats() {
    return {
      size: this.cache.size,
      calculatedSize: this.cache.calculatedSize,
      max: this.cache.max
    }
  }
}

// Instâncias globais de cache
export const productsCache = new MemoryCache(200, 1000 * 60 * 30) // 30 min para produtos
export const cartCache = new MemoryCache(1000, 1000 * 60 * 5)     // 5 min para carrinho
export const imageCache = new MemoryCache(100, 1000 * 60 * 60)    // 1 hora para imagens

// Função helper para gerar chaves de cache
export function getCacheKey(prefix: string, ...params: (string | number)[]): string {
  return `${prefix}:${params.join(':')}`
}

// Cache decorator para funções async
export function cached<T>(
  cache: MemoryCache,
  keyGenerator: (...args: any[]) => string,
  ttl?: number
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]): Promise<T> {
      const key = keyGenerator(...args)
      
      // Tentar buscar do cache
      const cached = cache.get<T>(key)
      if (cached !== undefined) {
        return cached
      }

      // Executar função original e cachear resultado
      const result = await method.apply(this, args)
      cache.set(key, result, ttl)
      
      return result
    }

    return descriptor
  }
}

// Sistema de invalidação de cache por tags
export class TaggedCache {
  private cache: MemoryCache
  private tagToKeys: Map<string, Set<string>> = new Map()
  private keyToTags: Map<string, Set<string>> = new Map()

  constructor(maxSize = 500, ttl = 1000 * 60 * 30) {
    this.cache = new MemoryCache(maxSize, ttl)
  }

  set(key: string, value: any, tags: string[] = [], ttl?: number): void {
    this.cache.set(key, value, ttl)
    
    // Associar tags às chaves
    const keyTags = new Set(tags)
    this.keyToTags.set(key, keyTags)
    
    tags.forEach(tag => {
      if (!this.tagToKeys.has(tag)) {
        this.tagToKeys.set(tag, new Set())
      }
      this.tagToKeys.get(tag)!.add(key)
    })
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key)
  }

  invalidateByTag(tag: string): void {
    const keys = this.tagToKeys.get(tag)
    if (!keys) return

    keys.forEach(key => {
      this.cache.delete(key)
      this.keyToTags.delete(key)
    })
    
    this.tagToKeys.delete(tag)
  }

  invalidateMultipleTags(tags: string[]): void {
    tags.forEach(tag => this.invalidateByTag(tag))
  }
}

// Cache global com tags para invalidação seletiva
export const taggedCache = new TaggedCache(300, 1000 * 60 * 15) // 15 min

// Cache com tags para invalidação seletiva de produtos
export const productTaggedCache = new TaggedCache(300, 1000 * 60 * 15) // 15 min

// Funções utilitárias para cache de produtos
export function invalidateProductCache(productId: string) {
  // Limpar cache geral de produtos
  productsCache.clear()
  
  // Invalidar cache específico do produto
  productTaggedCache.invalidateByTag(`product:${productId}`)
  productTaggedCache.invalidateByTag('products:list')
  
  console.log(`🔄 Cache invalidado para produto: ${productId}`)
}

export function invalidateAllProductsCache() {
  productsCache.clear()
  productTaggedCache.invalidateByTag('products:list')
  console.log('🔄 Cache geral de produtos invalidado')
}