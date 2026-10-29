type Block =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; alt: string }

function parseContent(content: string): Block[] {
  const blocks: Block[] = []
  const lines = content.split('\n')
  let paragraphBuf: string[] = []

  const flush = () => {
    if (paragraphBuf.length === 0) return
    const text = paragraphBuf.join('\n').trim()
    if (text) blocks.push({ type: 'text', text })
    paragraphBuf = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    const m = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
    if (m) {
      flush()
      blocks.push({ type: 'image', alt: m[1] || '', url: m[2] })
    } else {
      paragraphBuf.push(line)
    }
  }
  flush()
  return blocks
}

export default function NewsContent({ content }: { content: string }) {
  const blocks = parseContent(content)
  return (
    <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
      {blocks.map((b, i) => {
        if (b.type === 'image') {
          return (
            <figure key={i} className="my-5">
              <img
                src={b.url}
                alt={b.alt}
                loading="lazy"
                className="rounded-xl w-full max-h-[600px] object-contain bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d]"
              />
              {b.alt && (
                <figcaption className="text-xs text-slate-400 dark:text-slate-500 text-center mt-2">
                  {b.alt}
                </figcaption>
              )}
            </figure>
          )
        }
        return (
          <p key={i} className="whitespace-pre-wrap break-words">
            {b.text}
          </p>
        )
      })}
    </div>
  )
}