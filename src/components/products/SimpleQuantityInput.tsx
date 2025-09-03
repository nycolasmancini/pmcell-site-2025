'use client'

import { useState, useCallback, useEffect } from 'react'

interface SimpleQuantityInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
}

export default function SimpleQuantityInput({ 
  value, 
  onChange, 
  placeholder = "0",
  className = ""
}: SimpleQuantityInputProps) {
  const [inputValue, setInputValue] = useState<string>(value > 0 ? value.toString() : '')
  const [isFocused, setIsFocused] = useState(false)

  // Sincronizar inputValue com value externo quando não estiver focado
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value > 0 ? value.toString() : '')
    }
  }, [value, isFocused])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    
    // Permitir string vazia ou apenas números positivos
    if (newValue === '' || /^\d+$/.test(newValue)) {
      setInputValue(newValue)
    }
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    const numValue = parseInt(inputValue) || 0
    onChange(numValue)
    setInputValue(numValue > 0 ? numValue.toString() : '')
  }, [inputValue, onChange])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const numValue = parseInt(inputValue) || 0
      onChange(numValue)
      setInputValue(numValue > 0 ? numValue.toString() : '')
      e.currentTarget.blur()
    }
  }, [inputValue, onChange])

  const hasQuantity = value > 0

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      placeholder={placeholder}
      data-no-auto-focus="true"
      className={`w-16 text-center py-1 px-2 text-sm border rounded-md transition-all duration-200 font-medium ${
        isFocused 
          ? 'border-blue-400 ring-2 ring-blue-200 bg-blue-50 text-blue-900' 
          : hasQuantity
            ? 'border-green-400 bg-green-50 text-green-900 hover:border-green-500'
            : 'border-gray-300 bg-white hover:border-gray-400 text-gray-700'
      } ${className}`}
      title="Digite a quantidade desejada"
    />
  )
}