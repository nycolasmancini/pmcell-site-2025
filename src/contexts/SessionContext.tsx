'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SessionContextType {
  unlocked: boolean
  whatsapp: string | null
  sessionId: string | null
  unlockPrices: (whatsapp: string) => Promise<void>
  checkSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [whatsapp, setWhatsapp] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const checkSession = async () => {
    try {
      const response = await fetch('/api/session')
      const data = await response.json()
      
      setUnlocked(data.unlocked || false)
      setWhatsapp(data.whatsapp || null)
      setSessionId(data.sessionId || null)
    } catch (error) {
      console.error('Error checking session:', error)
    }
  }

  const unlockPrices = async (whatsappNumber: string) => {
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp: whatsappNumber })
      })

      if (response.ok) {
        const data = await response.json()
        setUnlocked(true)
        setWhatsapp(whatsappNumber)
        setSessionId(data.sessionId)
      } else {
        throw new Error('Failed to unlock prices')
      }
    } catch (error) {
      console.error('Error unlocking prices:', error)
      throw error
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <SessionContext.Provider
      value={{
        unlocked,
        whatsapp,
        sessionId,
        unlockPrices,
        checkSession
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}