import { useId } from 'react'

interface Props {
  tier: number
  size?: number
  className?: string
}

// Палитры для каждого tier (0–6)
const PALETTES: Record<
  number,
  {
    outer: string
    outerEnd: string
    inner: string
    innerEnd: string
    glow: string | null
    sparks: string | null
    scale: number
  }
> = {
  0: { outer: '#cbd5e1', outerEnd: '#94a3b8', inner: '#e2e8f0', innerEnd: '#cbd5e1', glow: null, sparks: null, scale: 0.85 },
  1: { outer: '#fbbf24', outerEnd: '#f59e0b', inner: '#fef3c7', innerEnd: '#fde68a', glow: null, sparks: null, scale: 1 },
  2: { outer: '#fb923c', outerEnd: '#ea580c', inner: '#fed7aa', innerEnd: '#fdba74', glow: 'rgba(251,146,60,0.35)', sparks: null, scale: 1.05 },
  3: { outer: '#f97316', outerEnd: '#dc2626', inner: '#fdba74', innerEnd: '#fca5a5', glow: 'rgba(249,115,22,0.45)', sparks: null, scale: 1.1 },
  4: { outer: '#dc2626', outerEnd: '#9f1239', inner: '#fca5a5', innerEnd: '#fda4af', glow: 'rgba(220,38,38,0.55)', sparks: '#fda4af', scale: 1.15 },
  5: { outer: '#3b82f6', outerEnd: '#4f46e5', inner: '#bfdbfe', innerEnd: '#a5b4fc', glow: 'rgba(59,130,246,0.6)', sparks: '#93c5fd', scale: 1.2 },
  6: { outer: '#6366f1', outerEnd: '#06b6d4', inner: '#a5b4fc', innerEnd: '#67e8f9', glow: 'rgba(99,102,241,0.7)', sparks: '#a5b4fc', scale: 1.25 },
}

export default function FireIcon({ tier, size = 48, className = '' }: Props) {
  const uid = useId().replace(/:/g, '')
  const palette = PALETTES[tier] ?? PALETTES[0]
  const s = Math.round(size * palette.scale)

  const outerGradId = `fo-${uid}`
  const innerGradId = `fi-${uid}`
  const glowFilterId = `fg-${uid}`

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        filter: palette.glow ? `drop-shadow(0 0 6px ${palette.glow})` : undefined,
        overflow: 'visible'
      }}
    >
      <defs>
        <linearGradient id={outerGradId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={palette.outerEnd} />
          <stop offset="100%" stopColor={palette.outer} />
        </linearGradient>
        <linearGradient id={innerGradId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={palette.innerEnd} />
          <stop offset="100%" stopColor={palette.inner} />
        </linearGradient>
        {palette.glow && (
          <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        )}
      </defs>

      {/* Искры для высоких уровней */}
      {palette.sparks && (
        <g opacity="0.9">
          <circle cx="4" cy="6" r="0.9" fill={palette.sparks}>
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="20" cy="5" r="0.7" fill={palette.sparks}>
            <animate attributeName="opacity" values="1;0.3;1" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="21" cy="10" r="0.6" fill={palette.sparks}>
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="3" cy="11" r="0.5" fill={palette.sparks}>
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* Внешний огонь */}
      <path
        d="M12 22.5
           C 6.5 22.5, 3 18.5, 3 14
           C 3 10.5, 4.5 7.5, 6.5 5
           C 6.8 7.5, 7.5 9.5, 8.5 10.5
           C 7.5 7, 9 4, 11 1.5
           C 11.2 4, 12 6, 13 7.5
           C 14 5.5, 15 4.5, 16 3
           C 17.5 5.5, 18 7.5, 18.2 9.5
           C 19.2 8.5, 19.8 7, 20 5
           C 21 8, 21 11.5, 21 15
           C 21 19, 17.5 22.5, 12 22.5 Z"
        fill={`url(#${outerGradId})`}
      />

      {/* Внутренний (светлый) огонь */}
      <path
        d="M12 20.5
           C 9 20.5, 6.5 18.5, 6.5 15.5
           C 6.5 13, 7.5 11, 8.8 9
           C 9 11, 9.8 12, 10.5 12.5
           C 9.8 10, 10.8 8, 12 6.5
           C 12.2 8.5, 13 10, 14 11
           C 15 9.5, 15.5 8, 15.8 6.5
           C 16.8 8.5, 17 10.5, 17 13
           C 17.5 12.5, 17.8 11.5, 18 10.5
           C 18.2 12, 17.5 14, 17.5 15.5
           C 17.5 18.5, 15 20.5, 12 20.5 Z"
        fill={`url(#${innerGradId})`}
      />

      {/* Искристая точка в центре для tier 6 */}
      {tier === 6 && (
        <circle cx="12" cy="16" r="1" fill="#ffffff" opacity="0.9">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  )
}