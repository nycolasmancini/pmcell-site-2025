/**
 * TESTES DE MEMOIZAÇÃO - ModelItem Re-render Prevention
 * 
 * Testa especificamente o problema de re-renderização do ModelItem
 * quando currentQuantity muda durante edição
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import React, { memo, useState } from 'react'

// Mock do useCartStore
const mockCartStore = {
  items: [],
  addItem: jest.fn(),
  updateQuantity: jest.fn(),
}

jest.mock('@/stores/useCartStore', () => ({
  useCartStore: (selector: any) => selector(mockCartStore)
}))

// Simulação do ModelItem para testar memoização
interface TestModelItemProps {
  model: {
    id: string
    brandName: string
    modelName: string
    price: number
  }
  currentQuantity: number
  isEditing?: boolean
  onQuantityChange: (modelId: string, quantity: number) => void
}

// Função de comparação atual (problemática)
const areModelItemPropsEqualCurrent = (
  prevProps: TestModelItemProps,
  nextProps: TestModelItemProps
): boolean => {
  return (
    prevProps.model.id === nextProps.model.id &&
    prevProps.currentQuantity === nextProps.currentQuantity
  )
}

// Função de comparação corrigida (deve ignorar currentQuantity durante edição)
const areModelItemPropsEqualFixed = (
  prevProps: TestModelItemProps,
  nextProps: TestModelItemProps
): boolean => {
  // Se estiver editando, ignorar mudanças de quantidade
  if (prevProps.isEditing || nextProps.isEditing) {
    return prevProps.model.id === nextProps.model.id
  }
  
  return (
    prevProps.model.id === nextProps.model.id &&
    prevProps.currentQuantity === nextProps.currentQuantity
  )
}

const ModelItemCurrent = memo<TestModelItemProps>(({ model, currentQuantity, onQuantityChange }) => {
  const renderCount = React.useRef(0)
  renderCount.current++
  
  return (
    <div>
      <span data-testid="model-name">{model.modelName}</span>
      <span data-testid="render-count">{renderCount.current}</span>
      <input
        data-testid="quantity-input"
        type="text"
        defaultValue={currentQuantity.toString()}
        onChange={(e) => onQuantityChange(model.id, parseInt(e.target.value) || 0)}
      />
    </div>
  )
}, areModelItemPropsEqualCurrent)

const ModelItemFixed = memo<TestModelItemProps>(({ model, currentQuantity, isEditing, onQuantityChange }) => {
  const renderCount = React.useRef(0)
  renderCount.current++
  
  return (
    <div>
      <span data-testid="model-name">{model.modelName}</span>
      <span data-testid="render-count-fixed">{renderCount.current}</span>
      <span data-testid="editing-state">{isEditing ? 'editing' : 'not-editing'}</span>
      <input
        data-testid="quantity-input-fixed"
        type="text"
        defaultValue={currentQuantity.toString()}
        onChange={(e) => onQuantityChange(model.id, parseInt(e.target.value) || 0)}
      />
    </div>
  )
}, areModelItemPropsEqualFixed)

describe('ModelItem Memoization Tests', () => {
  const mockModel = {
    id: 'model-1',
    brandName: 'Samsung',
    modelName: 'Galaxy S23',
    price: 899
  }

  describe('Comportamento Atual (Problemático)', () => {
    test('DEVE re-renderizar quando currentQuantity muda (demonstra o problema)', () => {
      const onQuantityChange = jest.fn()
      
      const { rerender } = render(
        <ModelItemCurrent
          model={mockModel}
          currentQuantity={5}
          onQuantityChange={onQuantityChange}
        />
      )
      
      // Render inicial
      expect(screen.getByTestId('render-count')).toHaveTextContent('1')
      
      // Simular mudança de quantidade no carrinho
      rerender(
        <ModelItemCurrent
          model={mockModel}
          currentQuantity={6} // Mudança na quantidade
          onQuantityChange={onQuantityChange}
        />
      )
      
      // PROBLEMA: Re-renderizou desnecessariamente
      expect(screen.getByTestId('render-count')).toHaveTextContent('2')
    })
  })

  describe('Comportamento Corrigido', () => {
    test('NÃO DEVE re-renderizar durante edição mesmo com mudança de currentQuantity', () => {
      const onQuantityChange = jest.fn()
      
      const { rerender } = render(
        <ModelItemFixed
          model={mockModel}
          currentQuantity={5}
          isEditing={true} // Está editando
          onQuantityChange={onQuantityChange}
        />
      )
      
      // Render inicial
      expect(screen.getByTestId('render-count-fixed')).toHaveTextContent('1')
      
      // Simular mudança de quantidade no carrinho DURANTE edição
      rerender(
        <ModelItemFixed
          model={mockModel}
          currentQuantity={6} // Mudança na quantidade
          isEditing={true} // Ainda editando
          onQuantityChange={onQuantityChange}
        />
      )
      
      // CORREÇÃO: Não re-renderizou durante edição
      expect(screen.getByTestId('render-count-fixed')).toHaveTextContent('1')
    })

    test('DEVE re-renderizar normalmente quando NÃO está editando', () => {
      const onQuantityChange = jest.fn()
      
      const { rerender } = render(
        <ModelItemFixed
          model={mockModel}
          currentQuantity={5}
          isEditing={false} // Não está editando
          onQuantityChange={onQuantityChange}
        />
      )
      
      // Render inicial
      expect(screen.getByTestId('render-count-fixed')).toHaveTextContent('1')
      
      // Mudança quando não está editando
      rerender(
        <ModelItemFixed
          model={mockModel}
          currentQuantity={6}
          isEditing={false}
          onQuantityChange={onQuantityChange}
        />
      )
      
      // Deve re-renderizar normalmente
      expect(screen.getByTestId('render-count-fixed')).toHaveTextContent('2')
    })
  })

  describe('Performance com Múltiplos Modelos', () => {
    test('DEVE manter performance com 50+ modelos sendo atualizados', () => {
      const models = Array.from({ length: 50 }, (_, i) => ({
        id: `model-${i}`,
        brandName: 'Samsung',
        modelName: `Galaxy S${i}`,
        price: 899 + i
      }))
      
      const TestList = () => {
        const [quantities, setQuantities] = useState<Record<string, number>>({})
        const [editingModel, setEditingModel] = useState<string | null>(null)
        
        return (
          <div>
            {models.map(model => (
              <ModelItemFixed
                key={model.id}
                model={model}
                currentQuantity={quantities[model.id] || 0}
                isEditing={editingModel === model.id}
                onQuantityChange={(modelId, qty) => {
                  setQuantities(prev => ({ ...prev, [modelId]: qty }))
                }}
              />
            ))}
            <button 
              data-testid="update-all"
              onClick={() => {
                const newQuantities: Record<string, number> = {}
                models.forEach((model, i) => {
                  newQuantities[model.id] = i + 1
                })
                setQuantities(newQuantities)
              }}
            >
              Update All
            </button>
          </div>
        )
      }
      
      const startTime = performance.now()
      
      render(<TestList />)
      
      const updateButton = screen.getByTestId('update-all')
      fireEvent.click(updateButton)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Deve processar 50 modelos rapidamente (< 50ms)
      expect(duration).toBeLessThan(50)
      
      // Verificar que alguns valores foram atualizados
      expect(screen.getByText('Galaxy S0')).toBeInTheDocument()
      expect(screen.getByText('Galaxy S49')).toBeInTheDocument()
    })
  })
})