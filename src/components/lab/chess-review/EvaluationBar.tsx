import { evaluationPercent, formatEvaluation } from './ui'

interface EvaluationBarProps {
  evaluation: number
  orientation?: 'white' | 'black'
}

export function EvaluationBar({
  evaluation,
  orientation = 'white',
}: EvaluationBarProps) {
  const whitePercent = evaluationPercent(evaluation)
  const label = `Position evaluation ${formatEvaluation(evaluation)} from White's perspective`
  const whiteAtBottom = orientation === 'white'

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-inner"
      data-evaluation-orientation={orientation}
    >
      <meter
        className="sr-only"
        min={-10}
        max={10}
        value={Math.max(-10, Math.min(10, evaluation / 100))}
        aria-label={label}
      >
        {formatEvaluation(evaluation)}
      </meter>
      <div
        className={`absolute inset-x-0 bg-slate-50 transition-[height] duration-200 motion-reduce:transition-none ${
          whiteAtBottom ? 'bottom-0' : 'top-0'
        }`}
        style={{ height: `${whitePercent}%` }}
      />
      <span
        className={`absolute top-1 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold ${
          whiteAtBottom ? 'text-white' : 'text-slate-900'
        }`}
        data-evaluation-label-position="top"
      >
        {whiteAtBottom ? 'B' : 'W'}
      </span>
      <span
        className={`absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold ${
          whiteAtBottom ? 'text-slate-900' : 'text-white'
        }`}
        data-evaluation-label-position="bottom"
      >
        {whiteAtBottom ? 'W' : 'B'}
      </span>
    </div>
  )
}
