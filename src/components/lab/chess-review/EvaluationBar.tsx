import { evaluationPercent, formatEvaluation } from './ui'

interface EvaluationBarProps {
  evaluation: number
}

export function EvaluationBar({ evaluation }: EvaluationBarProps) {
  const whitePercent = evaluationPercent(evaluation)
  const label = `Position evaluation ${formatEvaluation(evaluation)} from White's perspective`

  return (
    <div className="relative w-7 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-inner sm:w-8">
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
        className="absolute inset-x-0 bottom-0 bg-slate-50 transition-[height] duration-200 motion-reduce:transition-none"
        style={{ height: `${whitePercent}%` }}
      />
      <span className="absolute top-1 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-white">
        B
      </span>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-slate-900">
        W
      </span>
      <span className="sr-only">{label}</span>
    </div>
  )
}
