import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SessionStore {
  sessionId: string | null
  whatsapp: string | null
  customerName: string | null
  isUnlocked: boolean
  unlockedAt: Date | null
  
  setSession: (data: {
    sessionId: string
    whatsapp?: string
    customerName?: string
  }) => void
  
  unlockPrices: (whatsapp: string, customerName?: string) => void
  clearSession: () => void
  isSessionValid: () => boolean
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessionId: null,
      whatsapp: null,
      customerName: null,
      isUnlocked: false,
      unlockedAt: null,
      
      setSession: (data) => {
        set({
          sessionId: data.sessionId,
          whatsapp: data.whatsapp || get().whatsapp,
          customerName: data.customerName || get().customerName,
        })
      },
      
      unlockPrices: (whatsapp, customerName) => {
        set({
          whatsapp,
          customerName: customerName || null,
          isUnlocked: true,
          unlockedAt: new Date(),
        })
      },
      
      clearSession: () => {
        set({
          sessionId: null,
          whatsapp: null,
          customerName: null,
          isUnlocked: false,
          unlockedAt: null,
        })
      },
      
      isSessionValid: () => {
        const { isUnlocked, unlockedAt } = get()
        if (!isUnlocked || !unlockedAt) return false
        
        // Sessão válida por 7 dias
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        return new Date(unlockedAt) > sevenDaysAgo
      },
    }),
    {
      name: 'session-storage',
    }
  )
)