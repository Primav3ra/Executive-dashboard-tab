import { useEffect, useId, useRef, useState } from 'react'
import type { SeriesPoint } from '../../data/types'
import { fmtAxis, fmtShort } from '../../lib/format'

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [w, setW] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

const niceMax = (v: number) => {
  const step = v <= 12 ? 4 : v <= 30 ? 10 : v <= 60 ? 20 : 25
  return Math.max(step * 3, Math.ceil(v / step) * step)
}

interface Props {
  data: SeriesPoint[]
  height?: number
  unit?: string
  onPointClick?: (p: SeriesPoint) => void
  ariaLabel: string
  yTicks?: number
}

export function TrendChart({ data, height = 150, unit = '', onPointClick, ariaLabel, yTicks = 3 }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const gid = useId().replace(/:/g, '')

  const padL = 30
  const padR = 10
  const padT = 8
  const padB = 22
  const innerW = Math.max(0, width - padL - padR)
  const innerH = height - padT - padB
  const max = niceMax(Math.max(...data.map((d) => d.value)))
  const x = (i: number) => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const y = (v: number) => padT + innerH - (v / max) * innerH

  const smooth = data
    .map((d, i) => {
      if (i === 0) return `M${x(0)},${y(d.value)}`
      const x0 = x(i - 1)
      const x1 = x(i)
      const cx = (x0 + x1) / 2
      return `C${cx},${y(data[i - 1].value)} ${cx},${y(d.value)} ${x1},${y(d.value)}`
    })
    .join(' ')
  const area = `${smooth} L${x(data.length - 1)},${padT + innerH} L${x(0)},${padT + innerH} Z`
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (max / yTicks) * i)
  const xLabelIdx = data.length <= 4 ? data.map((_, i) => i) : [0, Math.round((data.length - 1) / 3), Math.round(((data.length - 1) * 2) / 3), data.length - 1]

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const i = Math.round(((px - padL) / innerW) * (data.length - 1))
    setHover(Math.min(data.length - 1, Math.max(0, i)))
  }

  const last = data.length - 1
  const h = hover ?? null

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          onClick={() => h !== null && onPointClick?.(data[h])}
          className={onPointClick ? 'cursor-pointer' : undefined}
        >
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={width - padR} y1={y(t)} y2={y(t)} stroke="var(--color-gray-100)" />
              <text x={padL - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-gray-400 font-mono text-[10.5px]">
                {Math.round(t)}
              </text>
            </g>
          ))}
          <line x1={padL} x2={padL} y1={padT} y2={padT + innerH} stroke="var(--color-gray-200)" />
          {data.length > 1 && (
            <>
              <path d={area} fill={`url(#${gid})`} />
              <path d={smooth} fill="none" stroke="var(--color-accent)" strokeWidth={1.75} strokeLinecap="round" />
            </>
          )}
          {xLabelIdx.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={height - 4}
              textAnchor={i === 0 ? 'start' : i === last ? 'end' : 'middle'}
              className="fill-gray-500 font-mono text-[10.5px]"
            >
              {fmtAxis(data[i].date)}
            </text>
          ))}
          {h !== null && (
            <line x1={x(h)} x2={x(h)} y1={padT} y2={padT + innerH} stroke="var(--color-gray-300)" strokeDasharray="3 3" />
          )}
          <circle cx={x(last)} cy={y(data[last].value)} r={4.5} fill="var(--color-accent)" stroke="white" strokeWidth={2} />
          {h !== null && h !== last && <circle cx={x(h)} cy={y(data[h].value)} r={3.5} fill="white" stroke="var(--color-accent)" strokeWidth={1.75} />}
        </svg>
      )}
      {h !== null && width > 0 && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border border-default bg-white px-2.5 py-1.5 shadow-overlay"
          style={{ left: Math.min(Math.max(x(h), 60), width - 60), top: Math.max(0, y(data[h].value) - 52) }}
        >
          <div className="font-mono text-[11px] text-gray-500">{fmtShort(data[h].date)}</div>
          <div className="font-mono text-[13px] font-medium text-gray-900">
            {data[h].value}
            {unit}
          </div>
        </div>
      )}
    </div>
  )
}
