import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-7xl font-bold text-slate-200 dark:text-[#30363d]">404</div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Страница не найдена
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Возможно, ссылка устарела или страница была перемещена.
        </p>
        <Link
          to="/"
          className="inline-block bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
        >
          На главную
        </Link>
      </div>
    </div>
  )
}