import { useState } from 'react'
import { createSurvey, type SurveyCreateQuestion } from '../api/surveys'
import { IconPlus, IconTrash, IconX } from './Icons'

interface Props {
  actorId: number
  onClose: () => void
  onCreated: () => void
}

interface OptionInput {
  text: string
  value: number
}

interface QuestionInput {
  text: string
  options: OptionInput[]
}

function emptyQuestion(): QuestionInput {
  return {
    text: '',
    options: [
      { text: '', value: 1 },
      { text: '', value: 2 },
    ],
  }
}

export default function SurveyCreateModal({ actorId, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState(() => {
    // Через неделю
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 16)
  })
  const [rewardRating, setRewardRating] = useState(2)
  const [penaltyRating, setPenaltyRating] = useState(-1)

  const [questions, setQuestions] = useState<QuestionInput[]>([emptyQuestion()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateQuestion(qi: number, patch: Partial<QuestionInput>) {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)))
  }

  function updateOption(qi: number, oi: number, patch: Partial<OptionInput>) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) }
          : q
      )
    )
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()])
  }

  function removeQuestion(qi: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== qi))
  }

  function addOption(qi: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: [...q.options, { text: '', value: q.options.length + 1 }] } : q
      )
    )
  }

  function removeOption(qi: number, oi: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi && q.options.length > 2
          ? { ...q, options: q.options.filter((_, j) => j !== oi) }
          : q
      )
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (new Date(deadline).getTime() <= Date.now()) {
      setError('Дедлайн должен быть в будущем')
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) {
        setError(`Заполните текст вопроса №${i + 1}`)
        return
      }
      if (q.options.length < 2) {
        setError(`Вопрос №${i + 1} должен иметь минимум 2 варианта`)
        return
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          setError(`Заполните вариант ${j + 1} в вопросе №${i + 1}`)
          return
        }
      }
    }

    setLoading(true)
    try {
      const payloadQuestions: SurveyCreateQuestion[] = questions.map((q) => ({
        text: q.text.trim(),
        options: q.options.map((o) => ({
          text: o.text.trim(),
          value: o.value,
        })),
      }))

      // Формат даты для бэка: YYYY-MM-DDTHH:mm:ss
      const dl = deadline.length === 16 ? deadline + ':00' : deadline

      await createSurvey({
        creatorId: actorId,
        title: title.trim(),
        description: description.trim(),
        deadline: dl,
        rewardRating,
        penaltyRating,
        questions: payloadQuestions,
      })
      onCreated()
    } catch (e: any) {
      setError(e.response?.data || 'Не удалось создать опрос')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-2xl p-6 space-y-4 my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Новый опрос
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-100 dark:border-red-500/20">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Название *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Дедлайн *
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              + Рейтинг за прохождение
            </label>
            <input
              type="number"
              value={rewardRating}
              onChange={(e) => setRewardRating(Number(e.target.value))}
              min={0}
              step={0.5}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              - Рейтинг за непрохождение
            </label>
            <input
              type="number"
              value={penaltyRating}
              onChange={(e) => setPenaltyRating(Number(e.target.value))}
              max={0}
              step={0.5}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>
        </div>

        {/* Вопросы */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            Вопросы ({questions.length})
          </div>

          {questions.map((q, qi) => (
            <div
              key={qi}
              className="border border-slate-200 dark:border-[#30363d] rounded-lg p-3 space-y-2"
            >
              <div className="flex items-start gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 mt-2">
                  #{qi + 1}
                </span>
                <input
                  value={q.text}
                  onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                  placeholder="Текст вопроса"
                  className="flex-1 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                />
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qi)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Удалить вопрос"
                  >
                    <IconTrash size={16} />
                  </button>
                )}
              </div>

              <div className="pl-6 space-y-2">
                {q.options.map((o, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      value={o.text}
                      onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                      placeholder={`Вариант ${oi + 1}`}
                      className="flex-1 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500"
                    />
                    <input
                      type="number"
                      value={o.value}
                      onChange={(e) => updateOption(qi, oi, { value: Number(e.target.value) })}
                      title="Балл"
                      className="w-16 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2 py-1.5 text-sm text-center"
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qi, oi)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Удалить вариант"
                      >
                        <IconX size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(qi)}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                >
                  <IconPlus size={12} /> Добавить вариант
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full border border-dashed border-slate-300 dark:border-[#30363d] rounded-lg py-2 text-sm text-slate-600 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition inline-flex items-center justify-center gap-1"
          >
            <IconPlus size={14} /> Добавить вопрос
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#30363d]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {loading ? 'Создание...' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  )
}