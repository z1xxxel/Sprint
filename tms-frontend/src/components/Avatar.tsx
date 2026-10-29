interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-2xl',
}

export default function Avatar({ name, avatarUrl, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`${SIZES[size]} rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-medium shrink-0 overflow-hidden shadow-sm`}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  )
}