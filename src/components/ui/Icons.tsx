interface IconProps {
  className?: string
  size?: number
  style?: React.CSSProperties
  strokeWidth?: string
}

// Ícone para Todos os Produtos
export const TodosProdutosIcon = ({ className = "", size = 24, style }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
    style={{...style, transform: 'scaleY(-1)'}}
  >
    <path d="M11.52 22.59c-.13-.09-.29-.22-.35-.29-.06-.07-.62-.64-1.23-1.27-.62-.63-1.12-1.16-1.12-1.18 0-.02.13-.09.30-.14.33-.11 1.82-.51 2.07-.57.36-.08 1.83-.52 2.25-.68.17-.07.44-.17.62-.24.30-.12.46-.19 1.06-.46.56-.25 1.92-1.10 2.16-1.34.04-.04.13-.11.18-.15.06-.04.21-.16.32-.26.12-.10.28-.24.35-.31.16-.13.78-.75.85-.85.70-.95.89-1.42.86-2.14l-.01-.38-.16.31c-.59 1.12-1.49 2.01-3.16 3.11-.51.33-1.64.90-2.31 1.16-2.27.87-3.94 1.31-6.08 1.60l-.58.08-.49-.50c-.27-.27-.49-.51-.49-.52 0-.01.14-.04.32-.06.17-.01.82-.09 1.42-.17.61-.08 1.27-.16 1.47-.18.90-.10 2.22-.39 3.39-.74.45-.14 1.66-.57 1.82-.66.05-.02.30-.15.56-.27 1.19-.57 2.46-1.55 3.07-2.38.28-.38.60-1.01.71-1.39.18-.63.08-1.31-.27-1.86-.48-.73-1.27-1.24-2.36-1.52-1.14-.29-1.22-.29-3.43-.30-1.12 0-2.05-.01-2.06-.03-.01-.01-.03-.97-.04-2.12-.01-1.63-.03-2.09-.08-2.11-.03-.01-.35.26-.71.61-.35.35-.82.79-1.05.98-.70.62-1.48 1.36-1.54 1.47-.05.08-.06.97-.06 3.95 0 2.12.01 3.86.03 3.87.01.01.10.01.19-.02.09-.02.30-.07.46-.11.16-.03.55-.13.86-.21.31-.08.78-.20 1.04-.26.61-.15.71-.19.77-.32.03-.07.06-.86.08-2.15.02-1.13.05-2.07.07-2.09.04-.05.80.03 1.32.14 1.08.22 2.05.70 2.36 1.18.30.46.30.44.29.84-.01.48-.12.70-.63 1.21-.71.71-1.77 1.31-3.07 1.74-1.00.33-3.38.90-4.34 1.02-.09.01-.47.08-.85.14-1.17.20-1.32.22-1.41.17-.08-.04-.52-.49-2.09-2.10-1.69-1.73-1.79-1.86-1.79-2.30 0-.23.02-.28.18-.48.09-.12 1.43-1.48 2.95-3.04 2.38-2.42 5.10-5.19 6.83-6.98.56-.58.79-.72 1.20-.72.16 0 .36.03.46.07.24.10 10.58 10.42 10.70 10.70.14.28.13.61-.04.85-.15.22-2.64 2.84-4.37 4.58-.60.61-1.37 1.39-1.70 1.74-.33.34-.98 1.01-1.46 1.48-.47.47-1.02 1.03-1.22 1.25-.20.22-.62.65-.92.96-.69.70-.84.78-1.47.78-.43 0-.46 0-.69-.17z" />
  </svg>
)

export const CaseIcon = ({ className = "", size = 24, style }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
    className={className}
    style={style}
  >
    <rect x="6" y="2" width="12" height="20" rx="2" ry="2"/>
    <circle cx="16" cy="6" r="1.2"/>
  </svg>
)

export const ScreenProtectorIcon = ({ className = "", size = 24, style }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
    className={className}
    style={style}
  >
    <rect x="6" y="3" width="10" height="18" rx="1.5" ry="1.5"/>
    <line x1="8" y1="6" x2="14" y2="12"/>
  </svg>
)

export const WiredHeadphonesIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    className={className}
    style={style}
  >
    <path d="M7 4v6a1 1 0 0 0 1 1h1v3"/>
    <path d="M17 4v6a1 1 0 0 1-1 1h-1v3"/>
  </svg>
)

export const BluetoothHeadphonesIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    className={className}
    style={style}
  >
    <path d="M8 5a2 2 0 0 1 4 0v6a2 2 0 1 1-4 0V5Z"/>
    <path d="M12 8h3v4"/>
  </svg>
)

export const SpeakerIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    className={className}
    style={style}
  >
    <rect x="5" y="8" width="14" height="10" rx="2"/>
    <circle cx="12" cy="13" r="2"/>
  </svg>
)

export const SmartwatchIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    className={className}
    style={style}
  >
    <rect x="7" y="6" width="10" height="12" rx="2"/>
    <path d="M12 10v2l1 1"/>
  </svg>
)

export const CableIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    className={className}
    style={style}
  >
    <path d="M6 12v4a2 2 0 0 0 2 2h2"/>
    <rect x="10" y="17" width="4" height="2" rx="0.5"/>
  </svg>
)

export const ChargerIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    className={className}
    style={style}
  >
    <rect x="8" y="4" width="8" height="14" rx="2"/>
    <path d="M12 7v4l2-2"/>
  </svg>
)

export const CarChargerIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    className={className}
    style={style}
  >
    <path d="M10 4h4v4l2 2v6l-2 2v2h-4v-2l-2-2V10l2-2V4Z"/>
  </svg>
)

// Ícones adicionais úteis para o e-commerce
export const PhoneIcon = ({ className = "", size = 24, style }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
    className={className}
    style={style}
  >
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
)

export const ShoppingCartIcon = ({ className = "", size = 24, style }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
    className={className}
    style={style}
  >
    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
  </svg>
)

export const StoreIcon = ({ className = "", size = 24, style }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
    className={className}
    style={style}
  >
    <path d="M3 21h18"/>
    <path d="M5 21V7l8-4v18"/>
    <path d="M19 21V7l-8-4v18"/>
    <path d="M9 9v12"/>
    <path d="M15 9v12"/>
  </svg>
)

export const BoxIcon = ({ className = "", size = 24, style }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
    className={className}
    style={style}
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

// Ícone para Suportes Veiculares
export const CarHolderIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    className={className}
    style={style}
  >
    <path d="M4 16c0 .796.316 1.559.879 2.121C5.441 18.684 6.204 19 7 19h10c.796 0 1.559-.316 2.121-.879C19.684 17.559 20 16.796 20 16"/>
    <path d="M4 12h16"/>
    <path d="M8 8h8"/>
    <rect x="6" y="6" width="12" height="8" rx="2"/>
  </svg>
)

// Ícone para Adaptadores
export const AdapterIcon = ({ className = "", size = 24, style }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
    className={className}
    style={style}
  >
    <rect x="4" y="4" width="6" height="6" rx="1"/>
    <rect x="14" y="14" width="6" height="6" rx="1"/>
    <path d="M10 7h4l2 2v4"/>
    <path d="M14 17h-4l-2-2v-4"/>
  </svg>
)

// Ícone para Capas
export const CapasIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps & { strokeWidth?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M12 16.01L12.01 15.9989" />
    <path d="M7 19.4V4.6C7 4.26863 7.26863 4 7.6 4H16.4C16.7314 4 17 4.26863 17 4.6V19.4C17 19.7314 16.7314 20 16.4 20H7.6C7.26863 20 7 19.7314 7 19.4Z" />
  </svg>
)

// Ícone para Películas
export const PeliculaIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps & { strokeWidth?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M12 16.01L12.01 15.9989" />
    <path d="M7 19.4V4.6C7 4.26863 7.26863 4 7.6 4H16.4C16.7314 4 17 4.26863 17 4.6V19.4C17 19.7314 16.7314 20 16.4 20H7.6C7.26863 20 7 19.7314 7 19.4Z" />
  </svg>
)

// Ícone para Fones Bluetooth
export const FonesBluetoothIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps & { strokeWidth?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M6.75 8L17.25 16.5L11.75 22V2L17.25 7.5L6.75 16" />
  </svg>
)

// Ícone para Caixas de Som
export const CaixasSomIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps & { strokeWidth?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M1 13.8571V10.1429C1 9.03829 1.89543 8.14286 3 8.14286H5.9C6.09569 8.14286 6.28708 8.08544 6.45046 7.97772L12.4495 4.02228C13.1144 3.5839 14 4.06075 14 4.85714V19.1429C14 19.9392 13.1144 20.4161 12.4495 19.9777L6.45046 16.0223C6.28708 15.9146 6.09569 15.8571 5.9 15.8571H3C1.89543 15.8571 1 14.9617 1 13.8571Z" />
    <path d="M17.5 7.5C17.5 7.5 19 9 19 11.5C19 14 17.5 15.5 17.5 15.5" />
    <path d="M20.5 4.5C20.5 4.5 23 7 23 11.5C23 16 20.5 18.5 20.5 18.5" />
  </svg>
)

// Ícone para Cabos
export const CabosIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps & { strokeWidth?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M12.5 2V17" />
    <path d="M12.5 14L18 12V8.5" />
    <path d="M12.5 16L7 14.5V11.5" />
    <path d="M12.5 22C13.8807 22 15 20.8807 15 19.5C15 18.1193 13.8807 17 12.5 17C11.1193 17 10 18.1193 10 19.5C10 20.8807 11.1193 22 12.5 22Z" />
    <path d="M16.5 5.5V8.5H19.5V5.5H16.5Z" />
    <path d="M10.5 4L12.5 2L14.5 4" />
    <path d="M7 11C8.10457 11 9 10.1046 9 9C9 7.89543 8.10457 7 7 7C5.89543 7 5 7.89543 5 9C5 10.1046 5.89543 11 7 11Z" />
  </svg>
)

// Ícone para Carregadores
export const CarregadoresIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps & { strokeWidth?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
    <path d="M9 10V14" />
    <path d="M15 10V14" />
  </svg>
)

// Ícone para Suportes
export const SuportesIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps & { strokeWidth?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M4 7L4 17" />
    <path d="M1 7L23 7" />
    <path d="M4 10L20 10" />
    <path d="M20 7L20 17" />
  </svg>
)

// Ícone para Carregadores Veicular
export const CarregadoresVeicularIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps & { strokeWidth?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M8 10L16 10" />
    <path d="M7 14L8 14" />
    <path d="M16 14L17 14" />
    <path d="M3 18V11.4105C3 11.1397 3.05502 10.8716 3.16171 10.6227L5.4805 5.21216C5.79566 4.47679 6.51874 4 7.31879 4H16.6812C17.4813 4 18.2043 4.47679 18.5195 5.21216L20.8383 10.6227C20.945 10.8716 21 11.1397 21 11.4105V18M3 18V20.4C3 20.7314 3.26863 21 3.6 21H6.4C6.73137 21 7 20.7314 7 20.4V18M3 18H7M21 18V20.4C21 20.7314 20.7314 21 20.4 21H17.6C17.2686 21 17 20.7314 17 20.4V18M21 18H17M7 18H17" />
  </svg>
)

// Ícone para Smartwatch
export const SmartwatchCustomIcon = ({ className = "", size = 24, style, strokeWidth = "1.5" }: IconProps & { strokeWidth?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M16 16.4722V20C16 21.1045 15.1046 22 14 22H10C8.89543 22 8 21.1045 8 20V16.4722" />
    <path d="M8 7.52779V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V7.52779" />
    <path d="M18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12Z" />
    <path d="M14 12H12V10" />
  </svg>
)

// Ícone para Fones
export const FonesIcon = ({ className = "", size = 24, style, strokeWidth = "1.5", isActive = false }: IconProps & { strokeWidth?: string, isActive?: boolean }) => {
  if (isActive) {
    // Versão preenchida para quando estiver clicado/ativo
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
        style={style}
      >
        <path d="M4 13.5V13C4 8.02944 7.58172 4 12 4C16.4183 4 20 8.02944 20 13V13.5" />
        <path d="M2 17.4382V15.5614C2 14.6436 2.62459 13.8437 3.51493 13.6211L4 13.4998L5.25448 13.1862C5.63317 13.0915 6 13.3779 6 13.7683V19.2313C6 19.6217 5.63317 19.9081 5.25448 19.8134L3.51493 19.3785C2.62459 19.1559 2 18.356 2 17.4382Z" fill="currentColor" />
        <path d="M22 17.4382V15.5614C22 14.6436 21.3754 13.8437 20.4851 13.6211L20 13.4998L18.7455 13.1862C18.3668 13.0915 18 13.3779 18 13.7683V19.2313C18 19.6217 18.3668 19.9081 18.7455 19.8134L20.4851 19.3785C21.3754 19.1559 22 18.356 22 17.4382Z" fill="currentColor" />
      </svg>
    )
  } else {
    // Versão apenas com stroke para estado normal
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
        style={style}
      >
        <path d="M4 13.4998L3.51493 13.6211C2.62459 13.8437 2 14.6437 2 15.5614V17.4383C2 18.356 2.62459 19.156 3.51493 19.3786L5.25448 19.8135C5.63317 19.9081 6 19.6217 6 19.2314V13.7683C6 13.378 5.63317 13.0916 5.25448 13.1862L4 13.4998ZM4 13.4998V13C4 8.02944 7.58172 4 12 4C16.4183 4 20 8.02944 20 13V13.5M20 13.5L20.4851 13.6211C21.3754 13.8437 22 14.6437 22 15.5614V17.4383C22 18.356 21.3754 19.156 20.4851 19.3786L18.7455 19.8135C18.3668 19.9081 18 19.6217 18 19.2314V13.7683C18 13.378 18.3668 13.0916 18.7455 13.1862L20 13.5Z" />
      </svg>
    )
  }
}