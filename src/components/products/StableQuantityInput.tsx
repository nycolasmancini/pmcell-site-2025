'use client'

import { useState, useCallback, useRef, useEffect, memo } from 'react'

interface StableQuantityInputProps {
  modelId: string
  currentQuantity: number
  onQuantityCommit: (modelId: string, quantity: number) => void
  onEditingChange?: (isEditing: boolean) => void
  isDisabled?: boolean
  className?: string
}

const StableQuantityInputComponent = ({ 
  modelId, 
  currentQuantity = 0,
  onQuantityCommit,
  onEditingChange,
  isDisabled = false,
  className = '',
}: StableQuantityInputProps) => {
  
  // Estados minimalistas para controle preciso
  const [localValue, setLocalValue] = useState<string>(() => 
    currentQuantity > 0 ? currentQuantity.toString() : ''
  )
  const [isEditing, setIsEditing] = useState(false)
  const [buttonAnimation, setButtonAnimation] = useState<'increment' | 'decrement' | null>(null)
  
  // Refs para valores estáveis
  const inputRef = useRef<HTMLInputElement>(null)
  const commitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isEditingRef = useRef<boolean>(false)
  const lastCurrentQuantityRef = useRef<number>(currentQuantity)
  
  // Sincronização apenas quando componente não está editando e valor mudou externamente
  useEffect(() => {
    if (!isEditing && currentQuantity !== lastCurrentQuantityRef.current) {
      const newValue = currentQuantity > 0 ? currentQuantity.toString() : ''
      setLocalValue(newValue)
      lastCurrentQuantityRef.current = currentQuantity
    }
  }, [currentQuantity, isEditing])
  
  // Atualizar ref quando estado de edição muda
  useEffect(() => {
    isEditingRef.current = isEditing
  }, [isEditing])

  // Função de commit simplificada - sem verificações que causam loops
  const commitQuantity = useCallback(() => {
    const numValue = Math.max(0, parseInt(localValue) || 0)
    
    onQuantityCommit(modelId, numValue)
    setIsEditing(false)
    isEditingRef.current = false
  }, [modelId, onQuantityCommit, localValue])

  // Handler de mudança - sem debounce automático
  const handleInputChange = useCallback((value: string) => {
    // Permitir string vazia ou apenas números positivos
    if (value !== '' && !/^\d+$/.test(value)) {
      return
    }
    
    setLocalValue(value)
    
    if (!isEditing) {
      setIsEditing(true)
      isEditingRef.current = true
      onEditingChange?.(true)
    }
    
    // Limpar timeout anterior
    if (commitTimeoutRef.current) {
      clearTimeout(commitTimeoutRef.current)
    }
  }, [isEditing, onEditingChange])

  // Handler de foco - início da edição
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(true)
    isEditingRef.current = true
    onEditingChange?.(true)
    
    // Usar setTimeout para garantir que a seleção aconteça após o foco
    setTimeout(() => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        inputRef.current.select()
      }
    }, 0)
  }, [onEditingChange])

  const handleBlur = useCallback(() => {
    // Sempre resetar o estado de edição e notificar pai
    setIsEditing(false)
    isEditingRef.current = false
    onEditingChange?.(false)
    
    // Pequeno delay para evitar conflitos com cliques nos botões
    setTimeout(() => {
      if (document.activeElement !== inputRef.current) {
        commitQuantity()
      }
    }, 50)
  }, [commitQuantity, onEditingChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitQuantity()
      inputRef.current?.blur()
    }
  }, [commitQuantity])

  // Handlers dos botões - evitam interferir com input focado
  const handleIncrement = useCallback(() => {
    // Se input estiver focado, não interferir
    if (isEditing) {
      return
    }
    
    // Usar currentQuantity como base para incremento, não localValue
    const newValue = currentQuantity + 1
    
    setLocalValue(newValue.toString())
    setButtonAnimation('increment')
    setTimeout(() => setButtonAnimation(null), 150)
    
    // Commit imediato
    onQuantityCommit(modelId, newValue)
  }, [modelId, onQuantityCommit, currentQuantity, isEditing])

  const handleDecrement = useCallback(() => {
    // Se input estiver focado, não interferir
    if (isEditing) {
      return
    }
    
    // Usar currentQuantity como base para decremento, não localValue
    const newValue = Math.max(0, currentQuantity - 1)
    
    setLocalValue(newValue > 0 ? newValue.toString() : '')
    setButtonAnimation('decrement')
    setTimeout(() => setButtonAnimation(null), 150)
    
    // Commit imediato
    onQuantityCommit(modelId, newValue)
  }, [modelId, onQuantityCommit, currentQuantity, isEditing])

  // Cleanup
  useEffect(() => {
    return () => {
      if (commitTimeoutRef.current) {
        clearTimeout(commitTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div 
      className={`flex items-center rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white ${
        isEditing ? 'no-animation-while-editing' : ''
      } ${className}`}
      data-editing={isEditing}
    >
      <button
        onClick={handleDecrement}
        disabled={isDisabled || currentQuantity === 0}
        className={`px-1.5 sm:px-3 py-1 sm:py-2 hover:bg-red-50 hover:text-red-600 text-gray-500 font-bold transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-300 active:scale-95 text-sm sm:text-base ${
          buttonAnimation === 'decrement' ? 'bg-red-100 text-red-700 scale-95' : ''
        }`}
      >
        −
      </button>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={localValue}
        data-no-auto-select="true"
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        disabled={isDisabled}
        style={{
          willChange: isEditing ? 'contents' : 'auto',
          transform: 'translateZ(0)', // Force GPU layer for performance
          backfaceVisibility: 'hidden', // Prevent flicker on GPU
        }}
        data-editing={isEditing}
        className={`w-10 sm:w-16 text-center py-1 sm:py-2 text-xs sm:text-sm font-semibold border-x border-gray-200 ${
          isEditing
            ? 'bg-blue-50 border-blue-400 focus:bg-blue-50 focus:ring-2 focus:ring-blue-400 text-blue-900'
            : 'bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-300'
        } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Digite a quantidade e pressione Enter ou clique fora para aplicar"
        placeholder="0"
        autoComplete="off"
      />
      <button
        onClick={handleIncrement}
        disabled={isDisabled}
        className={`px-1.5 sm:px-3 py-1 sm:py-2 hover:bg-green-50 hover:text-green-600 text-gray-500 font-bold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-green-300 active:scale-95 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
          buttonAnimation === 'increment' ? 'bg-green-100 text-green-700 scale-95' : ''
        }`}
      >
        +
      </button>
    </div>
  )
}

// Função de comparação otimizada para prevenir re-renders desnecessários
const arePropsEqual = (prevProps: StableQuantityInputProps, nextProps: StableQuantityInputProps) => {
  return (
    prevProps.modelId === nextProps.modelId &&
    prevProps.currentQuantity === nextProps.currentQuantity &&
    prevProps.isDisabled === nextProps.isDisabled &&
    prevProps.className === nextProps.className &&
    prevProps.onEditingChange === nextProps.onEditingChange
  )
}

// Exportar componente memoizado
export const StableQuantityInput = memo(StableQuantityInputComponent, arePropsEqual)