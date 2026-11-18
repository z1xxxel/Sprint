interface DiffPart {
  type: 'same' | 'added' | 'removed'
  text: string
}

function diffWords(oldStr: string, newStr: string): DiffPart[] {
  const oldWords = oldStr.split(/(\s+)/)
  const newWords = newStr.split(/(\s+)/)

  const m = oldWords.length
  const n = newWords.length

  // Защита от гигантских текстов
  if (m * n > 4_000_000) {
    return [
      { type: 'removed', text: oldStr },
      { type: 'added', text: newStr },
    ]
  }

  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const result: DiffPart[] = []
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (oldWords[i - 1] === newWords[j - 1]) {
      result.unshift({ type: 'same', text: oldWords[i - 1] })
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      result.unshift({ type: 'removed', text: oldWords[i - 1] })
      i--
    } else {
      result.unshift({ type: 'added', text: newWords[j - 1] })
      j--
    }
  }
  while (i > 0) {
    result.unshift({ type: 'removed', text: oldWords[i - 1] })
    i--
  }
  while (j > 0) {
    result.unshift({ type: 'added', text: newWords[j - 1] })
    j--
  }

  return result
}

export default function TextDiff({
  oldText,
  newText,
  oldTitle,
  newTitle,
}: {
  oldText: string
  newText: string
  oldTitle?: string
  newTitle?: string
}) {
  const parts = diffWords(oldText, newText)

  const leftParts = parts.filter((p) => p.type !== 'added')
  const rightParts = parts.filter((p) => p.type !== 'removed')

  const hasTextChanges = parts.some((p) => p.type !== 'same')
  const titleChanged =
    oldTitle !== undefined && newTitle !== undefined && oldTitle !== newTitle

  const removedCount = parts.filter((p) => p.type === 'removed').length
  const addedCount = parts.filter((p) => p.type === 'added').length

  if (!hasTextChanges && !titleChanged) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0d1117] p-3 rounded-lg">
        Изменений нет
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Изменение заголовка */}
      {titleChanged && (
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Заголовок
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-lg p-3 text-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Было</div>
              <div className="text-slate-700 dark:text-slate-300 line-through decoration-red-500/60">
                {oldTitle}
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg p-3 text-sm">
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 font-semibold">
                Станет
              </div>
              <div className="text-slate-900 dark:text-white font-medium">
                {newTitle}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Изменение текста */}
      {hasTextChanges ? (
        <>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              −{removedCount} слов
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              +{addedCount} слов
            </span>
          </div>

          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Текст
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Было
                </div>
                <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words max-h-[400px] overflow-y-auto">
                  {leftParts.map((p, idx) =>
                    p.type === 'removed' ? (
                      <span
                        key={idx}
                        className="bg-red-100 dark:bg-red-500/30 text-red-800 dark:text-red-300 line-through rounded px-0.5"
                      >
                        {p.text}
                      </span>
                    ) : (
                      <span key={idx}>{p.text}</span>
                    )
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 font-semibold">
                  Станет
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words max-h-[400px] overflow-y-auto">
                  {rightParts.map((p, idx) =>
                    p.type === 'added' ? (
                      <span
                        key={idx}
                        className="bg-emerald-100 dark:bg-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded px-0.5 font-medium"
                      >
                        {p.text}
                      </span>
                    ) : (
                      <span key={idx}>{p.text}</span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0d1117] p-3 rounded-lg">
          Текст не изменился — правился только заголовок или категория
        </div>
      )}
    </div>
  )
}