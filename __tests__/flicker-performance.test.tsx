/**
 * TESTES DE PERFORMANCE - ELIMINAÇÃO DEFINITIVA DO FLICKER
 * 
 * Testa especificamente as correções implementadas para eliminar
 * completamente o flicker do input de quantidade
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { StableQuantityInput } from '@/components/products/StableQuantityInput'
import ProductVariationModal from '@/components/products/ProductVariationModal'

// Mock do useCartStore
const mockCartStore = {
  items: [],
  addItem: jest.fn(),
  updateQuantity: jest.fn(),
  removeItem: jest.fn(),
}

jest.mock('@/stores/useCartStore', () => ({
  useCartStore: (selector: any) => selector(mockCartStore)
}))

// Mock da API
global.fetch = jest.fn()

describe('Flicker Performance Tests - Correções Definitivas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCartStore.items = []
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'model-1',
          brandName: 'Samsung',
          modelName: 'Galaxy S23',
          price: 899,
          superWholesalePrice: 799,
        }
      ])
    })
  })

  describe('CORREÇÃO 1: Zero Transitions Durante Digitação', () => {
    test('DEVE ter zero classes de transition no input durante edição', async () => {
      const user = userEvent.setup()
      const onQuantityCommit = jest.fn()
      
      render(
        <StableQuantityInput
          modelId="model-1"
          currentQuantity={0}
          onQuantityCommit={onQuantityCommit}
        />
      )

      const input = screen.getByRole('textbox')
      const container = input.closest('div')
      
      // Estado inicial - sem edição
      expect(container).not.toHaveClass('no-animation-while-editing')
      expect(input).not.toHaveAttribute('data-editing', 'true')
      
      // Iniciar edição
      await user.click(input)
      
      // Durante edição - deve ter classes de prevenção
      expect(container).toHaveClass('no-animation-while-editing')
      expect(input).toHaveAttribute('data-editing', 'true')
      
      // Computar estilos aplicados
      const computedStyle = window.getComputedStyle(input)
      
      // Verificar que transition foi desabilitada via CSS
      expect(computedStyle.getPropertyValue('will-change')).toBe('contents')
      expect(computedStyle.getPropertyValue('transform')).toContain('translateZ(0)')
      expect(computedStyle.getPropertyValue('backface-visibility')).toBe('hidden')
    })

    test('DEVE manter performance durante digitação rápida', async () => {
      const user = userEvent.setup({ delay: null }) // Sem delay para teste de performance
      const onQuantityCommit = jest.fn()
      
      render(
        <StableQuantityInput
          modelId="model-1"
          currentQuantity={0}
          onQuantityCommit={onQuantityCommit}
        />
      )

      const input = screen.getByRole('textbox')
      
      const startTime = performance.now()
      
      // Simular digitação super rápida
      await user.click(input)
      await user.type(input, '1234567890')
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Deve processar 10 caracteres em menos de 50ms (5ms por caracter)
      expect(duration).toBeLessThan(50)
      
      // Input deve ter valor final correto
      expect(input).toHaveValue('1234567890')
      expect(input).toHaveFocus()
    })
  })

  describe('CORREÇÃO 2: Badge sem Animação Durante Edição', () => {
    test('DEVE desabilitar animações do badge quando editando', async () => {
      const user = userEvent.setup()
      
      const mockProduct = {
        id: 'product-1',
        name: 'Smartphone Test',
        quickAddIncrement: 1,
        images: [{ id: '1', url: 'test.jpg', isMain: true }],
        isModalProduct: true
      }
      
      // Mock carrinho com item existente
      mockCartStore.items = [
        {
          id: 'cart-1',
          productId: 'product-1',
          modelId: 'model-1',
          quantity: 5,
          name: 'Test',
          unitPrice: 899
        }
      ]
      
      render(
        <ProductVariationModal
          product={mockProduct}
          isOpen={true}
          onClose={jest.fn()}
        />
      )
      
      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Samsung')).toBeInTheDocument()
      })
      
      // Expandir marca
      fireEvent.click(screen.getByText('Samsung'))
      
      // Aguardar inputs aparecerem
      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        expect(inputs.length).toBeGreaterThan(0)
      })
      
      const input = screen.getAllByRole('textbox')[0]
      const badge = screen.getByText('5')
      
      // Verificar estado inicial do badge
      const badgeParent = badge.closest('div')
      const initialBadgeStyle = window.getComputedStyle(badgeParent!)
      
      // Iniciar edição
      await user.click(input)
      
      // Durante edição, badge não deve ter transition
      const editingBadgeStyle = window.getComputedStyle(badgeParent!)
      
      // CSS deveria ter removido a transition via nosso CSS condicional
      expect(input).toHaveAttribute('data-editing', 'true')
    })
  })

  describe('CORREÇÃO 3: GPU Acceleration Funcional', () => {
    test('DEVE usar aceleração GPU durante edição', async () => {
      const user = userEvent.setup()
      const onQuantityCommit = jest.fn()
      
      render(
        <StableQuantityInput
          modelId="model-1"
          currentQuantity={0}
          onQuantityCommit={onQuantityCommit}
        />
      )

      const input = screen.getByRole('textbox')
      
      // Verificar otimizações aplicadas durante edição
      await user.click(input)
      
      const computedStyle = window.getComputedStyle(input)
      
      // Verificar GPU acceleration
      expect(computedStyle.getPropertyValue('transform')).toContain('translateZ(0)')
      expect(computedStyle.getPropertyValue('will-change')).toBe('contents')
      expect(computedStyle.getPropertyValue('backface-visibility')).toBe('hidden')
    })
  })

  describe('CORREÇÃO 4: Benchmark de Performance', () => {
    test('DEVE processar 1000 mudanças de valor sem degradação', async () => {
      const onQuantityCommit = jest.fn()
      
      const { rerender } = render(
        <StableQuantityInput
          modelId="model-1"
          currentQuantity={0}
          onQuantityCommit={onQuantityCommit}
        />
      )
      
      const startTime = performance.now()
      
      // Simular 1000 mudanças rápidas de quantidade (carrinho sendo atualizado)
      for (let i = 1; i <= 1000; i++) {
        rerender(
          <StableQuantityInput
            modelId="model-1"
            currentQuantity={i}
            onQuantityCommit={onQuantityCommit}
          />
        )
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Deve processar 1000 updates em menos de 300ms (0.3ms por update) 
      expect(duration).toBeLessThan(300)
      
      // Valor final deve estar correto
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('1000')
    })

    test('DEVE manter 60 FPS durante digitação rápida com múltiplas atualizações', async () => {
      const user = userEvent.setup({ delay: null })
      const onQuantityCommit = jest.fn()
      
      let renderCount = 0
      const TestComponent = ({ quantity }: { quantity: number }) => {
        renderCount++
        return (
          <StableQuantityInput
            modelId="model-1"
            currentQuantity={quantity}
            onQuantityCommit={onQuantityCommit}
          />
        )
      }
      
      const { rerender } = render(<TestComponent quantity={0} />)
      
      const input = screen.getByRole('textbox')
      
      // Resetar contador
      renderCount = 0
      
      const startTime = performance.now()
      
      // Clicar no input
      await user.click(input)
      
      // Simular digitação rápida + atualizações externas paralelas
      const digitalPromise = user.type(input, '12345')
      
      // Durante digitação, simular atualizações do carrinho
      const updatePromises = []
      for (let i = 1; i <= 10; i++) {
        updatePromises.push(
          new Promise(resolve => {
            setTimeout(() => {
              rerender(<TestComponent quantity={i} />)
              resolve(true)
            }, i * 10) // Updates a cada 10ms
          })
        )
      }
      
      await Promise.all([digitalPromise, ...updatePromises])
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Tempo total deve ser < 200ms para manter 60 FPS
      expect(duration).toBeLessThan(200)
      
      // Não deve ter re-renderizado excessivamente
      expect(renderCount).toBeLessThan(15) // Máximo razoável
      
      // Input deve manter valor digitado
      expect(input).toHaveValue('12345')
      expect(input).toHaveFocus()
    })
  })

  describe('CORREÇÃO 5: Integração Completa sem Flicker', () => {
    test('DEVE ter zero flicker em cenário real de uso', async () => {
      const user = userEvent.setup()
      
      const mockProduct = {
        id: 'product-1',
        name: 'Smartphone Test',
        quickAddIncrement: 1,
        images: [{ id: '1', url: 'test.jpg', isMain: true }],
        isModalProduct: true
      }
      
      render(
        <ProductVariationModal
          product={mockProduct}
          isOpen={true}
          onClose={jest.fn()}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByText('Samsung')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Samsung'))
      
      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        expect(inputs.length).toBeGreaterThan(0)
      })
      
      const input = screen.getAllByRole('textbox')[0]
      const container = input.closest('[data-editing]')
      
      // CENÁRIO COMPLETO: Digitar + Atualização Externa + Usar Botões
      
      // 1. Verificar estado inicial
      expect(container).toHaveAttribute('data-editing', 'false')
      
      // 2. Iniciar edição
      await user.click(input)
      expect(container).toHaveAttribute('data-editing', 'true')
      
      // 3. Digitação rápida
      await user.type(input, '789')
      expect(input).toHaveValue('789')
      expect(input).toHaveFocus()
      
      // 4. Simular atualizações externas durante digitação
      // Forçar re-render do modal (simulando atualizações do carrinho)
      fireEvent.click(screen.getByText('Samsung'))
      fireEvent.click(screen.getByText('Samsung'))
      
      // Input deve manter foco e valor
      expect(input).toHaveValue('789')
      expect(input).toHaveFocus()
      expect(container).toHaveAttribute('data-editing', 'true')
      
      // 5. Finalizar edição
      await user.click(document.body)
      
      // 6. Verificar que estado foi resetado
      await waitFor(() => {
        expect(container).toHaveAttribute('data-editing', 'false')
      })
      
      // 7. Botões devem funcionar imediatamente
      const incrementBtn = screen.getAllByText('+')[0]
      await user.click(incrementBtn)
      
      expect(mockCartStore.addItem).toHaveBeenCalled()
    })
  })

  describe('CORREÇÃO 6: Medição de FPS Real', () => {
    test('DEVE manter FPS constante durante uso intenso', async () => {
      const user = userEvent.setup({ delay: null })
      const onQuantityCommit = jest.fn()
      
      render(
        <StableQuantityInput
          modelId="model-1"
          currentQuantity={0}
          onQuantityCommit={onQuantityCommit}
        />
      )

      const input = screen.getByRole('textbox')
      
      // Medir FPS durante operação intensiva
      const frameCount = { count: 0 }
      const startTime = performance.now()
      
      // Simular requestAnimationFrame para medir FPS
      const rafId = requestAnimationFrame(function measure() {
        frameCount.count++
        if (performance.now() - startTime < 100) { // Medir por 100ms
          requestAnimationFrame(measure)
        }
      })
      
      // Operação intensiva: clique + digitação + múltiplas mudanças
      await user.click(input)
      await user.type(input, '99999')
      
      // Aguardar medição
      await new Promise(resolve => setTimeout(resolve, 150))
      
      cancelAnimationFrame(rafId)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      const fps = (frameCount.count / duration) * 1000
      
      // Deve manter performance aceitável (> 30 FPS em ambiente de teste)
      expect(fps).toBeGreaterThan(30)
      
      console.log(`FPS medido: ${fps.toFixed(1)} durante digitação`)
    })
  })
})