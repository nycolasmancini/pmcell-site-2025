'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, Edit3, User, Package, ArrowLeft, MessageCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/stores/useCartStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { useSession } from '@/contexts/SessionContext'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/ui/Toast'

interface OrderCompletionSidebarProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  orderNumber: number
  subtotal: number
  itemsCount: number
}

export function OrderCompletionSidebar({ 
  isOpen, 
  onClose, 
  onBack, 
  orderNumber, 
  subtotal, 
  itemsCount 
}: OrderCompletionSidebarProps) {
  const { clearCart, items } = useCartStore()
  const { whatsapp: storeWhatsapp, customerName: storeCustomerName } = useSessionStore()
  const { whatsapp: contextWhatsapp } = useSession()
  const { toasts, showToast, removeToast } = useToast()
  
  const [customerName, setCustomerName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [isEditingWhatsapp, setIsEditingWhatsapp] = useState(false)
  const [originalWhatsapp, setOriginalWhatsapp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Usar whatsapp do contexto como prioridade (é onde vem o dado real)
  const sessionWhatsapp = contextWhatsapp || storeWhatsapp
  const sessionCustomerName = storeCustomerName

  // Função para formatar WhatsApp para exibição (remover código do país e formatar)
  const formatWhatsAppForDisplay = (phone: string) => {
    if (!phone) return ''
    
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '')
    
    // Se começar com 55, remove
    const withoutCountry = numbers.startsWith('55') ? numbers.substring(2) : numbers
    
    // Aplica máscara brasileira
    if (withoutCountry.length === 11) {
      return withoutCountry.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (withoutCountry.length === 10) {
      return withoutCountry.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    
    return withoutCountry
  }

  // Inicializar com dados da sessão quando abrir
  useEffect(() => {
    if (isOpen) {
      setCustomerName(sessionCustomerName || '')
      const formattedWhatsapp = formatWhatsAppForDisplay(sessionWhatsapp || '')
      setWhatsappNumber(formattedWhatsapp)
      setOriginalWhatsapp(formattedWhatsapp)
      setIsEditingWhatsapp(false)
    }
  }, [isOpen, sessionWhatsapp, sessionCustomerName])

  const handleWhatsappEdit = () => {
    if (!isEditingWhatsapp) {
      setOriginalWhatsapp(whatsappNumber)
    }
    setIsEditingWhatsapp(!isEditingWhatsapp)
  }

  const handleSaveWhatsapp = () => {
    // Aqui você pode implementar a lógica para salvar os dados
    // salvando tanto o número antigo quanto o novo se houve alteração
    if (originalWhatsapp && originalWhatsapp !== whatsappNumber) {
      console.log('WhatsApp alterado:', {
        original: originalWhatsapp,
        novo: whatsappNumber
      })
    }
    setIsEditingWhatsapp(false)
  }

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)
    
    try {
      // Pegar itens do carrinho (usar items já disponível)
      
      // Converter WhatsApp para formato brasileiro (adicionar 55 se necessário)
      const cleanWhatsapp = whatsappNumber.replace(/\D/g, '')
      const finalWhatsapp = cleanWhatsapp.length === 11 ? `55${cleanWhatsapp}` : cleanWhatsapp
      
      // Preparar dados do pedido
      const orderData = {
        customer: {
          name: customerName.trim(),
          whatsapp: finalWhatsapp,
          email: '', // Opcional
          company: '', // Opcional
          cnpj: '' // Opcional
        },
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          modelId: item.modelId || undefined,
          modelName: item.modelName || undefined
        })),
        notes: '' // Observações do cliente (opcional)
      }
      
      console.log('Enviando pedido:', orderData)
      
      // Enviar pedido para a API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar pedido')
      }
      
      const order = await response.json()
      console.log('Pedido criado com sucesso:', order)
      
      // Mostrar toast de sucesso
      showToast(
        'Pedido enviado com sucesso! Em breve um de nossos vendedores entrará em contato.',
        'success'
      )
      
      // Limpar carrinho após sucesso
      clearCart()
      setIsSubmitting(false)
      
      // Fechar modal após envio
      setTimeout(() => {
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('Erro ao enviar pedido:', error)
      setIsSubmitting(false)
      
      // Aqui você pode mostrar uma mensagem de erro para o usuário
      alert(`Erro ao enviar pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  const formatWhatsapp = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11)
    
    // Aplica máscara (99) 99999-9999
    if (limited.length <= 10) {
      return limited.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
    } else {
      return limited.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
    }
  }

  const handleWhatsappChange = (value: string) => {
    const formatted = formatWhatsapp(value)
    setWhatsappNumber(formatted)
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
          isOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col
          transition-all duration-300 ease-out transform ${
            isOpen 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-full opacity-0'
          }`}
        style={{
          boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.1), -10px 0 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b backdrop-blur-sm bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              Pedido Finalizado
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Success Icon & Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle className="w-12 h-12 text-green-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 animate-in slide-in-from-bottom duration-300 delay-200">
              Parabéns! 🎉
            </h3>
            <p className="text-gray-600 leading-relaxed animate-in slide-in-from-bottom duration-300 delay-300">
              Seu pedido foi processado com sucesso e nossa equipe entrará em contato em breve para confirmar os detalhes.
            </p>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Number */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-l-4 border-[#FC6D36] animate-in slide-in-from-left duration-300 delay-400">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-[#FC6D36]" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Número do Pedido</p>
                  <p className="text-xl font-bold text-[#FC6D36]">#{orderNumber}</p>
                </div>
              </div>
            </div>

            {/* Customer Name */}
            <div className="space-y-3 animate-in slide-in-from-right duration-300 delay-500">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                Como prefere ser chamado?
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Digite seu nome"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FC6D36] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-3 animate-in slide-in-from-left duration-300 delay-600">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <div className="w-4 h-4 rounded bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                {sessionWhatsapp ? 'Confirme seu WhatsApp' : 'WhatsApp para contato'}
              </label>
              {sessionWhatsapp && !isEditingWhatsapp && (
                <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  ✅ Usando o número cadastrado em sua sessão
                </p>
              )}
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  placeholder={sessionWhatsapp ? formatWhatsAppForDisplay(sessionWhatsapp) : "(11) 99999-9999"}
                  disabled={!isEditingWhatsapp}
                  className={`flex-1 px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 ${
                    isEditingWhatsapp 
                      ? 'focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white' 
                      : 'bg-gray-50 text-gray-600'
                  }`}
                />
                <button
                  onClick={isEditingWhatsapp ? handleSaveWhatsapp : handleWhatsappEdit}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isEditingWhatsapp
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isEditingWhatsapp ? 'Salvar alteração' : 'Editar número'}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              {originalWhatsapp && originalWhatsapp !== whatsappNumber && whatsappNumber && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  ⚠️ Número alterado. Anterior: {originalWhatsapp}
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 animate-in slide-in-from-bottom duration-300 delay-700">
              <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Resumo do Pedido
              </h4>
              
              {itemsCount > 0 && subtotal > 0 ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantidade de itens:</span>
                    <span className="font-medium">{itemsCount} unidades</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">✅ Pedido mínimo atingido</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Valor Total:</span>
                    <span className="text-[#FC6D36]">{formatPrice(subtotal)}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-500 text-sm">
                    <p>📦 Seu pedido foi processado com sucesso!</p>
                    <p className="mt-2">Os detalhes serão confirmados por nossa equipe.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-xl p-4 animate-in slide-in-from-bottom duration-300 delay-800">
              <h4 className="font-semibold text-blue-900 mb-3">Próximos Passos</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Nossa equipe entrará em contato em até 2 horas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Confirmaremos os detalhes e formas de pagamento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Processaremos seu pedido rapidamente</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-white space-y-3">
          <button
            onClick={handleSubmitOrder}
            disabled={!customerName.trim() || !whatsappNumber.trim() || isSubmitting}
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${
              customerName.trim() && whatsappNumber.trim() && !isSubmitting
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Enviando pedido...
              </div>
            ) : (
              'Confirmar e Enviar Pedido'
            )}
          </button>
          
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Ao confirmar, você concorda com nossos termos de serviço e política de privacidade. 
            Seu pedido será processado com segurança.
          </p>
        </div>
      </div>
      
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )
}