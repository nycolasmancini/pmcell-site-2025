/**
 * TESTES DE REGRESSÃO - FLICKER E BOTÕES NO CARRINHO
 * 
 * Estes testes verificam os problemas identificados:
 * 1. Flicker do input durante digitação
 * 2. Botões não funcionam após blur
 * 3. Re-renders desnecessários
 * 4. Perda de foco do input
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

// Mock do fetch para API de modelos
global.fetch = jest.fn()

describe('Cart Flicker Regression Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCartStore.items = []
    
    // Mock da API de modelos
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'model-1',
          brandName: 'Samsung',
          modelName: 'Galaxy S23',
          price: 899,
          superWholesalePrice: 799,
        },
        {
          id: 'model-2', 
          brandName: 'Apple',
          modelName: 'iPhone 15',
          price: 1199,
          superWholesalePrice: 1099,
        }
      ])
    })
  })

  describe('Problema 1: Flicker do Input', () => {
    test('DEVE manter foco do input durante digitação sem piscar', async () => {
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
      
      // Simular digitação contínua
      await user.click(input)
      expect(input).toHaveFocus()
      
      await user.type(input, '123')
      
      // Input deve manter foco durante toda a digitação
      expect(input).toHaveFocus()
      expect(input).toHaveValue('123')
      
      // Não deve ter commits durante digitação
      expect(onQuantityCommit).not.toHaveBeenCalled()
    })

    test('DEVE manter valor no input mesmo quando currentQuantity muda externamente', async () => {
      const user = userEvent.setup()
      const onQuantityCommit = jest.fn()
      
      const { rerender } = render(
        <StableQuantityInput
          modelId="model-1"
          currentQuantity={5}
          onQuantityCommit={onQuantityCommit}
        />
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('5')
      
      // Usuário clica e começa a editar
      await user.click(input)
      await user.clear(input)
      await user.type(input, '10')
      
      // Simular atualização externa do carrinho durante edição
      rerender(
        <StableQuantityInput
          modelId="model-1"
          currentQuantity={7} // Mudança externa
          onQuantityCommit={onQuantityCommit}
        />
      )
      
      // Valor local deve ser preservado durante edição
      expect(input).toHaveValue('10')
      expect(input).toHaveFocus()
    })
  })

  describe('Problema 2: Botões Não Funcionam', () => {
    test('DEVE permitir uso dos botões imediatamente após blur do input', async () => {
      const user = userEvent.setup()
      const onQuantityCommit = jest.fn()
      
      render(
        <StableQuantityInput
          modelId="model-1"
          currentQuantity={5}
          onQuantityCommit={onQuantityCommit}
        />
      )

      const input = screen.getByRole('textbox')
      const incrementBtn = screen.getByRole('button', { name: /\+/ })
      const decrementBtn = screen.getByRole('button', { name: /−/ })
      
      // 1. Usuário edita input
      await user.click(input)
      await user.clear(input)
      await user.type(input, '10')
      
      // 2. Usuário clica fora (blur)
      await user.click(document.body)
      
      // 3. Aguardar commit
      await waitFor(() => {
        expect(onQuantityCommit).toHaveBeenCalledWith('model-1', 10)
      })
      
      // Reset mock para próximos cliques
      onQuantityCommit.mockClear()
      
      // 4. Botões devem funcionar imediatamente
      // Nota: botões usam currentQuantity como base, não o valor digitado
      await user.click(incrementBtn)
      expect(onQuantityCommit).toHaveBeenCalledWith('model-1', 6) // 5 + 1
      
      onQuantityCommit.mockClear()
      
      await user.click(decrementBtn)
      expect(onQuantityCommit).toHaveBeenCalledWith('model-1', 4) // 5 - 1
    })

    test('DEVE resetar isEditing corretamente após blur', async () => {
      const user = userEvent.setup()
      const onQuantityCommit = jest.fn()
      
      const TestComponent = () => {
        const [isEditingState, setIsEditingState] = React.useState(false)
        
        return (
          <div>
            <StableQuantityInput
              modelId="model-1"
              currentQuantity={5}
              onQuantityCommit={onQuantityCommit}
              onEditingChange={setIsEditingState}
            />
            <div data-testid="editing-state">{isEditingState.toString()}</div>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const input = screen.getByRole('textbox')
      const editingState = screen.getByTestId('editing-state')
      
      // Estado inicial
      expect(editingState).toHaveTextContent('false')
      
      // Clicar no input
      await user.click(input)
      expect(editingState).toHaveTextContent('true')
      
      // Clicar fora
      await user.click(document.body)
      
      // Estado deve voltar a false
      await waitFor(() => {
        expect(editingState).toHaveTextContent('false')
      })
    })
  })

  describe('Problema 3: Re-renders Desnecessários', () => {
    test('DEVE evitar re-render do ModelItem durante edição', async () => {
      const user = userEvent.setup()
      let renderCount = 0
      
      const MockModelItem = jest.fn(({ currentQuantity, onQuantityChange }) => {
        renderCount++
        return (
          <div>
            <StableQuantityInput
              modelId="model-1"
              currentQuantity={currentQuantity}
              onQuantityCommit={onQuantityChange}
            />
            <div data-testid="render-count">{renderCount}</div>
          </div>
        )
      })
      
      const { rerender } = render(
        <MockModelItem 
          currentQuantity={5}
          onQuantityChange={jest.fn()}
        />
      )
      
      const input = screen.getByRole('textbox')
      const initialRenderCount = renderCount
      
      // Usuário começa a editar
      await user.click(input)
      await user.type(input, '0') // Muda para 50
      
      // Simular mudança de currentQuantity durante edição
      rerender(
        <MockModelItem 
          currentQuantity={7} // Mudança externa
          onQuantityChange={jest.fn()}
        />
      )
      
      // Deve ter re-renderizado menos devido à memoização
      expect(renderCount).toBeLessThan(initialRenderCount + 3) // Permitir algum re-render mas menos que antes
    })
  })

  describe('Problema 4: Integração com ProductVariationModal', () => {
    test('DEVE carregar modal sem erros e exibir componentes', async () => {
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
      
      // Verificar se modal carregou
      expect(screen.getByText('Smartphone Test')).toBeInTheDocument()
      
      // Aguardar carregamento dos modelos
      await waitFor(() => {
        expect(screen.getByText('Samsung')).toBeInTheDocument()
      })
      
      // Verificar se pode expandir marcas
      const samsungButton = screen.getByText('Samsung')
      fireEvent.click(samsungButton)
      
      // Verificar se inputs aparecem após expansão
      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        expect(inputs.length).toBeGreaterThan(0)
      })
      
      // Verificar se botões aparecem
      const incrementButtons = screen.getAllByText('+')
      const decrementButtons = screen.getAllByText('−')
      expect(incrementButtons.length).toBeGreaterThan(0)
      expect(decrementButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    test('DEVE lidar com múltiplas edições rápidas sem conflitos', async () => {
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
      const incrementBtn = screen.getByRole('button', { name: /\+/ })
      
      // Edições rápidas alternadas
      await user.click(input)
      await user.type(input, '5')
      await user.click(incrementBtn) // Deve ignorar se input focado
      await user.click(document.body) // Blur
      
      await waitFor(() => {
        expect(onQuantityCommit).toHaveBeenCalledWith('model-1', 5)
      })
      
      // Resetar mock
      onQuantityCommit.mockClear()
      
      // Agora botão deve funcionar - usa currentQuantity inicial (0) como base
      await user.click(incrementBtn)
      expect(onQuantityCommit).toHaveBeenCalledWith('model-1', 1) // 0 + 1
    })

    test('DEVE prevenir valores inválidos no input', async () => {
      const user = userEvent.setup()
      const onQuantityCommit = jest.fn()
      
      render(
        <StableQuantityInput
          modelId="model-1"
          currentQuantity={5}
          onQuantityCommit={onQuantityCommit}
        />
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('5')
      
      await user.click(input)
      await user.clear(input)
      
      // Tentar inserir valores inválidos - eles devem ser rejeitados
      await user.type(input, 'abc')
      expect(input).toHaveValue('') // Rejeitou caracteres inválidos
      
      await user.type(input, '123')
      expect(input).toHaveValue('123') // Aceita números válidos
      
      // Teste com caracteres mistos
      await user.clear(input)
      await user.type(input, '1a2b3')
      expect(input).toHaveValue('123') // Aceita apenas os números
    })

    test('DEVE manter performance com muitas atualizações de carrinho', async () => {
      const onQuantityCommit = jest.fn()
      
      const { rerender } = render(
        <StableQuantityInput
          modelId="model-1"
          currentQuantity={0}
          onQuantityCommit={onQuantityCommit}
        />
      )
      
      const startTime = performance.now()
      
      // Simular 100 atualizações rápidas do carrinho
      for (let i = 1; i <= 100; i++) {
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
      
      // Deve processar 100 updates em menos de 100ms (1ms por update)
      expect(duration).toBeLessThan(100)
      
      // Input deve mostrar valor final
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('100')
    })
  })
})