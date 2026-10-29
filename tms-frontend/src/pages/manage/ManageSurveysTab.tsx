import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import {
  getSurveys,
  deleteSurvey,
  getSurveyStats,
  type Survey,
  type SurveyStats,
} from '../../api/surveys'
import SurveyCreateModal from '../../components/SurveyCreateModal'
import { useAuth } from '../../store/auth'
import { IconPlus, IconTrash, IconChart } from '../../components/Icons'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ManageSurveysTab() {
  const user = useAuth((s) => s.user)!
  const { data, loading, error } = useFetch(() => getSurveys(), [])

  const [creating, setCreating] = useState(false)
  const [statsFor, setStatsFor] = useState<Survey | null>(null)
  const [localSurveys, setLocalSurveys] = useState<Survey[] | null>(null)

  const list = localSurveys ?? data ?? []

  async function handleDelete(s: Survey) {
    if (!confirm(`Удалить опрос «${s.title}»? Все ответы тоже удалятся.`)) return
    try {
      await deleteSurvey(s.id)
      setLocalSurveys(list.filter((x) => x.id !== s.id))
    } catch (e: any) {
      alert(e.response?.data || 'Не удалось удалить')
    }
  }

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Всего опросов: {list.length}
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition inline-flex items-center gap-1"
        >
          <IconPlus size={14} /> Создать опрос
        </button>
      </div>

      {list.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="text-slate-400 dark:text-slate-500 text-sm">
            Опросов пока нет
          </div>
        </div>
      )}

      <div className="space-y-2">
        {list.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4"
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {s.title}
                  </div>
                  {s.isActive ? (
                    <span className="text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-500/30">
                      Активен
                    </span>
                  ) : (
                    <span className="text-xs bg-slate-100 dark:bg-[#0d1117] text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-[#30363d]">
                      Завершён
                    </span>
                  )}
                </div>
                {s.description && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {s.description}
                  </div>
                )}
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Вопросов: {s.questions.length} · Дедлайн: {formatDate(s.deadline)}
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setStatsFor(s)}
                  className="text-xs px-2.5 py-1.5 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500 transition inline-flex items-center gap-1"
                >
                  <IconChart size={12} /> Статистика
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  className="text-xs px-2.5 py-1.5 border border-red-300 dark:border-red-500/30 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition inline-flex items-center gap-1"
                >
                  <IconTrash size={12} /> Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <SurveyCreateModal
          actorId={user.id}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            window.location.reload()
          }}
        />
      )}

      {statsFor && (
        <SurveyStatsModal
          surveyId={statsFor.id}
          title={statsFor.title}
          onClose={() => setStatsFor(null)}
        />
      )}
    </div>
  )
}

// ==========================================
// === Модалка статистики ===
// ==========================================
function SurveyStatsModal({
  surveyId,
  title,
  onClose,
}: {
  surveyId: number
  title: string
  onClose: () => void
}) {
  const { data, loading, error } = useFetch<SurveyStats>(
    () => getSurveyStats(surveyId),
    [surveyId]
  )

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-3xl p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Статистика опроса
            </h2>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {title}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2"
          >
            Закрыть
          </button>
        </div>

        {loading && <div className="text-slate-500 text-sm">Загрузка...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}

        {data && (
          <>
            {/* Сводка */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg p-3 border border-slate-200 dark:border-[#30363d]">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Всего сотрудников
                </div>
                <div className="text-xl font-semibold text-slate-900 dark:text-white mt-1">
                  {data.totalUsers}
                </div>
              </div>
              <div className="bg-brand-50 dark:bg-brand-500/10 rounded-lg p-3 border border-brand-200 dark:border-brand-500/30">
                <div className="text-xs text-brand-700 dark:text-brand-400 uppercase tracking-wider">
                  Ответили
                </div>
                <div className="text-xl font-semibold text-brand-700 dark:text-brand-400 mt-1">
                  {data.respondedUsers}
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3 border border-amber-200 dark:border-amber-500/30">
                <div className="text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Процент ответов
                </div>
                <div className="text-xl font-semibold text-amber-700 dark:text-amber-400 mt-1">
                  {data.responseRatePercent.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Прогресс */}
            <div className="h-2 bg-slate-100 dark:bg-[#0d1117] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, data.responseRatePercent)}%` }}
              />
            </div>

            {/* Вопросы */}
            <div className="space-y-4">
              {data.questions.map((q, qi) => (
                <div
                  key={q.questionId}
                  className="bg-slate-50 dark:bg-[#0d1117] rounded-lg p-4 border border-slate-200 dark:border-[#30363d]"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="font-medium text-sm text-slate-900 dark:text-white">
                      {qi + 1}. {q.questionText}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                      ответов: {q.totalAnswers} · ср. балл: {q.averageValue.toFixed(2)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {q.options.map((o) => (
                      <div key={o.optionId}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-700 dark:text-slate-300 truncate flex-1">
                            {o.optionText}
                            <span className="text-slate-400 dark:text-slate-500 ml-1">
                              (балл {o.value})
                            </span>
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium ml-2 shrink-0">
                            {o.count} ({o.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-white dark:bg-[#161b22] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, o.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}