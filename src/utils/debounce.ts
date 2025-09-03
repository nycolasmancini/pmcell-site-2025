/**
 * Utilitário de debounce para evitar múltiplas execuções
 * @param func Função a ser executada após o delay
 * @param delay Tempo em ms para esperar
 * @returns Função debounced
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * Throttle para limitar execução por tempo
 * @param func Função a ser executada
 * @param delay Tempo mínimo entre execuções
 * @returns Função throttled
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastExecution = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastExecution >= delay) {
      lastExecution = now
      func(...args)
    }
  }
}