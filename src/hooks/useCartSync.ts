import { useEffect, useCallback } from 'react'
import { useCartStore } from '@/stores/useCartStore'

export function useCartSync() {
  const { loadFromServer, isLoading, lastSyncTimestamp } = useCartStore()

  // Carregar carrinho do servidor quando componente montar
  const initializeCart = useCallback(async () => {
    console.log('🔄 CartSync: Inicializando sincronização...')
    try {
      await loadFromServer()
      console.log('✅ CartSync: Carrinho carregado do servidor')
    } catch (error) {
      console.warn('⚠️ CartSync: Erro ao carregar carrinho:', error)
    }
  }, [loadFromServer])

  // Effect para inicialização
  useEffect(() => {
    // Só executar se não houver sincronização recente (5 minutos)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    const shouldSync = !lastSyncTimestamp || lastSyncTimestamp < fiveMinutesAgo

    if (shouldSync) {
      initializeCart()
    } else {
      console.log('🔄 CartSync: Sincronização recente encontrada, pulando inicialização')
    }
  }, [initializeCart, lastSyncTimestamp])

  // Função para forçar sincronização manual
  const forceSync = useCallback(async () => {
    console.log('🔄 CartSync: Sincronização forçada solicitada...')
    await initializeCart()
  }, [initializeCart])

  return {
    isLoading,
    forceSync,
    lastSyncTimestamp
  }
}