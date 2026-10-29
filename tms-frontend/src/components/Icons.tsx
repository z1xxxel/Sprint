interface IconProps {
  size?: number
  className?: string
}

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
})

export const IconHome = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
)

export const IconUser = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

export const IconBag = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M6 7h12l1 13H5L6 7z" />
    <path d="M9 7V5a3 3 0 0 1 6 0v2" />
  </svg>
)

export const IconCalendar = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
)

export const IconTarget = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
)

export const IconChart = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 21V9M9 21V3M15 21v-8M21 21v-4" />
  </svg>
)

export const IconStar = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 3l2.7 5.7 6.3.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.3-.9L12 3z" />
  </svg>
)

export const IconStarFilled = ({ size = 20, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3l2.7 5.7 6.3.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.3-.9L12 3z" />
  </svg>
)

export const IconHeart = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </svg>
)

export const IconChat = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4 5h16v11H8l-4 4V5z" />
  </svg>
)

export const IconSupport = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 2-2 3.5" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
  </svg>
)

export const IconTrophy = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
    <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" />
    <path d="M12 13v4M9 21h6M10 17h4" />
  </svg>
)

export const IconTrophyFilled = ({ size = 20, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="#fbbf24"
    stroke="#d97706"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
    <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" fill="none" />
    <path d="M12 13v4M9 21h6M10 17h4" fill="none" />
  </svg>
)

// Медаль с номером места (1/2/3). Рисуется вручную, цвета gold/silver/bronze
export const IconMedal = ({
  size = 20,
  className,
  place,
}: IconProps & { place: 1 | 2 | 3 }) => {
  const palette = {
    1: { ring: '#fcd34d', core: '#f59e0b', dark: '#b45309' },
    2: { ring: '#e2e8f0', core: '#94a3b8', dark: '#475569' },
    3: { ring: '#fed7aa', core: '#ea580c', dark: '#9a3412' },
  }[place]

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M8.5 2 L10 8 L7 8 Z" fill={palette.dark} opacity="0.7" />
      <path d="M15.5 2 L14 8 L17 8 Z" fill={palette.dark} opacity="0.7" />
      <circle cx="12" cy="15" r="6.5" fill={palette.ring} />
      <circle cx="12" cy="15" r="4.8" fill={palette.core} />
      <text
        x="12"
        y="17.4"
        textAnchor="middle"
        fontSize="6"
        fontWeight="800"
        fill="#ffffff"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {place}
      </text>
    </svg>
  )
}

export const IconCheck = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M5 13l4 4L19 7" />
  </svg>
)

export const IconSettings = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
  </svg>
)

export const IconLogout = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M15 12H3M9 6l-6 6 6 6" />
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
  </svg>
)

export const IconSearch = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
)

export const IconSend = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
)

export const IconGift = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="3" y="8" width="18" height="13" rx="1" />
    <path d="M12 8v13M3 12h18M7.5 8a2.5 2.5 0 0 1 0-5C9 3 12 8 12 8s3-5 4.5-5a2.5 2.5 0 0 1 0 5" />
  </svg>
)

export const IconSun = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
)

export const IconMoon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

export const IconCart = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

export const IconTrash = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
)

export const IconPlus = ({ size = 20, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconMinus = ({ size = 20, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
  </svg>
)

export const IconPin = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

// ============ НОВЫЕ ИКОНКИ ============

export const IconEdit = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
)

export const IconX = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconArrowLeft = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

export const IconArrowRight = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

export const IconArrowUp = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
)

export const IconArrowDown = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
)

export const IconLock = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)

export const IconPaperclip = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
)

export const IconBell = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

export const IconEye = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const IconArchive = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="2" y="4" width="20" height="5" rx="1" />
    <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
    <path d="M10 13h4" />
  </svg>
)

export const IconRestore = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 12a9 9 0 1 0 2.6-6.4" />
    <path d="M3 3v5h5" />
  </svg>
)

export const IconClock = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)