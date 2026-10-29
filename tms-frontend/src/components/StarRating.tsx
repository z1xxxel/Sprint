import { useState } from 'react'
import { IconStarFilled } from './Icons'

interface Props {
  value: number | null          // текущее значение (для read-only — это avg)
  onChange?: (v: number) => void // если передан — становится интерактивным
  size?: number
  readOnly?: boolean
}

export default function StarRating({ value, onChange, size = 28, readOnly }: Props) {
  const [hover, setHover] = useState(0)
  const displayed = hover || value || 0
  const interactive = !readOnly && !!onChange

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange!(n)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <IconStarFilled
            size={size}
            className={n <= displayed ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}
          />
        </button>
      ))}
    </div>
  )
}