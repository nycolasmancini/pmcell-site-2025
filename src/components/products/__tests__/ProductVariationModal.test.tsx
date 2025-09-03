import { render, screen } from '@testing-library/react'
import ProductVariationModal from '../ProductVariationModal'

// Mock do store do carrinho
jest.mock('@/stores/useCartStore', () => ({
  useCartStore: jest.fn(() => ({
    items: [],
    addItem: jest.fn(),
    updateQuantity: jest.fn(),
  })),
}))

// Mock do fetch global
global.fetch = jest.fn()

const mockProduct = {
  id: 'test-product-id',
  name: 'Produto Teste',
  description: 'Descrição do produto teste',
  image: 'test-image.jpg',
  quickAddIncrement: 1,
  isModalProduct: true,
}

describe('ProductVariationModal - Current Structure', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })
  })

  test('should NOT have header at the top', () => {
    render(
      <ProductVariationModal 
        product={mockProduct} 
        isOpen={true} 
        onClose={() => {}} 
      />
    )

    // Deve conter apenas o título do produto no footer
    const productTitles = screen.getAllByText('Produto Teste')
    expect(productTitles).toHaveLength(1)
    
    // Header antigo não deve estar presente
    const headerTitle = document.getElementById('modal-title')
    expect(headerTitle).not.toBeInTheDocument()
    
    // Não deve haver div com border-b (que era o header)
    const headerDiv = document.querySelector('.border-b.bg-gradient-to-r')
    expect(headerDiv).not.toBeInTheDocument()
  })

  test('should NOT have test elements (cart quantity text and SimpleQuantityInput)', () => {
    render(
      <ProductVariationModal 
        product={mockProduct} 
        isOpen={true} 
        onClose={() => {}} 
      />
    )

    // Verificar que elementos de teste foram removidos
    const cartQuantityText = screen.queryByText(/Quantidade no carrinho:/i)
    expect(cartQuantityText).not.toBeInTheDocument()
    
    // Não deve haver input de teste manual
    const simpleInput = screen.queryByPlaceholderText('0')
    expect(simpleInput).not.toBeInTheDocument()
  })

  test('should have footer with product name and close button', () => {
    render(
      <ProductVariationModal 
        product={mockProduct} 
        isOpen={true} 
        onClose={() => {}} 
      />
    )

    // Footer deve estar presente
    const footer = screen.getByTestId('modal-footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('border-t')
    
    // Deve conter o nome do produto apenas no footer
    expect(screen.getByText('Produto Teste')).toBeInTheDocument()
    
    // Deve ter botão de fechar no footer
    const closeButton = screen.getByLabelText('Fechar modal')
    expect(closeButton).toBeInTheDocument()
  })

  test('should render when isOpen is true', () => {
    render(
      <ProductVariationModal 
        product={mockProduct} 
        isOpen={true} 
        onClose={() => {}} 
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('should not render when isOpen is false', () => {
    render(
      <ProductVariationModal 
        product={mockProduct} 
        isOpen={false} 
        onClose={() => {}} 
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('should have optimized content height without header', () => {
    render(
      <ProductVariationModal 
        product={mockProduct} 
        isOpen={true} 
        onClose={() => {}} 
      />
    )

    // Área de scroll deve usar mais espaço sem header
    const scrollArea = document.querySelector('.max-h-\\[calc\\(85vh-80px\\)\\]')
    expect(scrollArea).toBeInTheDocument()
    
    // Verificar que não há referência ao tamanho antigo (150px/200px)
    const oldScrollArea = document.querySelector('.max-h-\\[calc\\(85vh-150px\\)\\]')
    expect(oldScrollArea).not.toBeInTheDocument()
  })

  test('should maintain footer visibility and context when keyboard appears', () => {
    render(
      <ProductVariationModal 
        product={mockProduct} 
        isOpen={true} 
        onClose={() => {}} 
      />
    )

    // Footer deve estar fixo na parte inferior do modal
    const footer = screen.getByTestId('modal-footer')
    expect(footer).toBeInTheDocument()
    
    // Footer deve ter posicionamento que garante visibilidade mesmo com teclado
    expect(footer).toHaveClass('border-t')
    expect(footer).toHaveClass('bg-white')
    
    // Nome do produto deve permanecer visível no footer
    const productName = footer.querySelector('h3')
    expect(productName).toHaveTextContent('Produto Teste')
    expect(productName).toHaveClass('truncate') // Para não quebrar em telas pequenas
  })
})