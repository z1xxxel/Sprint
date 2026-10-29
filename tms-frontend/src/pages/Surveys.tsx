import { useState, useMemo } from 'react'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import {
  getSurveys,
  submitSurvey,
  getPassedSurveyIds,
  markSurveyPassed,
} from '../api/surveys'
import type { Survey, SurveyQuestion } from '../api/surveys'
import { IconCheck, IconArrowLeft, IconArrowRight, IconTrophy } from '../components/Icons'

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function daysLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function Surveys() {
  const user = useAuth((s) => s.user)!
  const { data, loading, error } = useFetch(() => getSurveys(true), [])

  const [passed, setPassed] = useState<Set<number>>(() => getPassedSurveyIds(user.id))
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null)

  const { available, done } = useMemo(() => {
    const now = Date.now()
    const a: Survey[] = []
    const d: Survey[] = []
    ;(data ?? []).forEach((s) => {
      const expired = new Date(s.deadline).getTime() < now
      if (passed.has(s.id) || expired) d.push(s)
      else a.push(s)
    })
    return { available: a, done: d }
  }, [data, passed])

  if (activeSurvey) {
    return (
      <SurveyForm
        survey={activeSurvey}
        userId={user.id}
        onBack={() => setActiveSurvey(null)}
        onSubmitted={() => {
          markSurveyPassed(user.id, activeSurvey.id)
          setPassed(getPassedSurveyIds(user.id))
          setActiveSurvey(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Опросы
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Проходите опросы и получайте рейтинг
        </p>
      </div>

      {loading && <div className="text-slate-500">Загрузка...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && available.length === 0 && done.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="text-slate-400 dark:text-slate-500 text-sm">
            Активных опросов пока нет
          </div>
        </div>
      )}

      {available.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Доступные
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {available.map((s) => (
              <SurveyCard key={s.id} survey={s} onOpen={() => setActiveSurvey(s)} />
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Пройденные и завершённые
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {done.map((s) => (
              <SurveyCard key={s.id} survey={s} isDone />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SurveyCard({
  survey,
  onOpen,
  isDone,
}: {
  survey: Survey
  onOpen?: () => void
  isDone?: boolean
}) {
  const expired = new Date(survey.deadline).getTime() < Date.now()
  const days = daysLeft(survey.deadline)

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5 space-y-3 flex flex-col">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">{survey.title}</h3>
          {isDone && (
            <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
              {expired ? 'Завершён' : 'Пройден'}
            </span>
          )}
        </div>
        {survey.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
            {survey.description}
          </p>
        )}
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div>Вопросов: {survey.questions.length}</div>
        <div>Дедлайн: {formatDeadline(survey.deadline)}</div>
        {!expired && days > 0 && (
          <div className="text-amber-600 dark:text-amber-400">
            Осталось {days} {days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}
          </div>
        )}
      </div>

      {/* Плашки награды и штрафа */}
      {(survey.rewardRating > 0 || survey.penaltyRating !== 0) && (
        <div className="flex flex-wrap gap-1.5">
          {survey.rewardRating > 0 && (
            <span className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 px-2 py-1 rounded text-xs font-medium">
              <IconTrophy size={12} />
              +{survey.rewardRating.toFixed(1)} рейтинга
            </span>
          )}
          {survey.penaltyRating !== 0 && (
            <span className="inline-flex items-center bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-2 py-1 rounded text-xs font-medium">
              {survey.penaltyRating.toFixed(1)} за непрохождение
            </span>
          )}
        </div>
      )}

      {onOpen && !isDone && !expired && (
        <button
          onClick={onOpen}
          className="mt-auto bg-brand-600 hover:bg-brand-700 text-white rounded-md py-2 text-sm font-medium transition"
        >
          Пройти опрос
        </button>
      )}
    </div>
  )
}

// ==========================================
// === ФОРМА ПРОХОЖДЕНИЯ ===
// ==========================================
function SurveyForm({
  survey,
  userId,
  onBack,
  onSubmitted,
}: {
  survey: Survey
  userId: number
  onBack: () => void
  onSubmitted: () => void
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const total = survey.questions.length
  const currentQuestion = survey.questions[currentStep]
  const answeredCount = Object.keys(answers).length
  const progress = total > 0 ? (answeredCount / total) * 100 : 0
  const allAnswered = answeredCount === total
  const isLast = currentStep === total - 1
  const isFirst = currentStep === 0

  function selectOption(optionId: number) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }))
    setError('')
  }

  function goNext() {
    if (!answers[currentQuestion.id]) {
      setError('Выберите один из вариантов')
      return
    }
    setError('')
    if (!isLast) setCurrentStep((s) => s + 1)
  }

  function goBack() {
    setError('')
    if (isFirst) {
      onBack()
      return
    }
    setCurrentStep((s) => s - 1)
  }

  async function handleSubmit() {
    if (!allAnswered) {
      setError('Ответьте на все вопросы')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await submitSurvey(survey.id, userId, answers)
      onSubmitted()
    } catch (err: any) {
      setError(err.response?.data || 'Не удалось отправить ответы')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Назад */}
      <button
        onClick={onBack}
        className="text-sm text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
      >
        <IconArrowLeft size={14} /> К списку опросов
      </button>

      {/* Шапка с прогрессом */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
          {survey.title}
        </h1>
        {survey.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            {survey.description}
          </p>
        )}

        {/* Плашки наград */}
        <div className="flex flex-wrap gap-2 mt-3">
          {survey.rewardRating > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 px-2.5 py-1 rounded-md text-xs font-medium">
              <IconTrophy size={12} />
              +{survey.rewardRating.toFixed(1)} рейтинга за прохождение
            </span>
          )}
          {survey.penaltyRating !== 0 && (
            <span className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-2.5 py-1 rounded-md text-xs font-medium">
              {survey.penaltyRating.toFixed(1)} рейтинга за непрохождение
            </span>
          )}
        </div>

        {/* Прогресс */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#30363d]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Вопрос {currentStep + 1} из {total}
            </span>
            <span>{answeredCount} / {total}</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-[#0d1117] rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Вопрос */}
      <QuestionStep
        key={currentQuestion.id}
        question={currentQuestion}
        index={currentStep}
        selectedOptionId={answers[currentQuestion.id]}
        onSelect={selectOption}
      />

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
          {error}
        </div>
      )}

      {/* Навигация */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={submitting}
          className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#30363d] rounded-md hover:border-brand-500 transition disabled:opacity-50"
        >
          {isFirst ? 'Отмена' : 'Назад'}
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !allAnswered}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {submitting ? 'Отправка...' : 'Отправить ответы'}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={!answers[currentQuestion.id]}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50 transition inline-flex items-center gap-1"
          >
            Далее <IconArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

function QuestionStep({
  question,
  index,
  selectedOptionId,
  onSelect,
}: {
  question: SurveyQuestion
  index: number
  selectedOptionId?: number
  onSelect: (optionId: number) => void
}) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="w-7 h-7 shrink-0 rounded-full bg-slate-100 dark:bg-[#21262d] text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-semibold">
          {index + 1}
        </span>
        <h2 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white leading-snug pt-0.5">
          {question.text}
        </h2>
      </div>

      <div className="space-y-2" role="radiogroup">
        {question.options.map((opt) => {
          const checked = selectedOptionId === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onSelect(opt.id)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition ${
                checked
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                  : 'border-slate-200 dark:border-[#30363d] hover:border-brand-300 dark:hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-[#0d1117]'
              }`}
            >
              <div
                className={`w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition ${
                  checked
                    ? 'border-brand-600'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {checked && <div className="w-2 h-2 rounded-full bg-brand-600" />}
              </div>
              <span
                className={`text-sm ${
                  checked
                    ? 'text-slate-900 dark:text-white font-medium'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.text}
              </span>
              {checked && (
                <span className="ml-auto shrink-0 text-brand-600 dark:text-brand-400">
                  <IconCheck size={16} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}