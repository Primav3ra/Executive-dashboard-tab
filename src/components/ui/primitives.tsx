import { Check, ChevronRight, Lock, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

// ── Buttons ──────────────────────────────────────────────────────────────

type Variant = 'outline' | 'primary' | 'soft' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  outline: 'border border-default bg-white text-gray-800 hover:border-hover hover:bg-gray-50 shadow-sm',
  primary: 'bg-accent text-white hover:bg-accent-hover shadow-sm',
  soft: 'bg-accent-subtle text-accent hover:bg-green-100',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-[15px] gap-2',
}

interface BtnProps {
  variant?: Variant
  size?: Size
  to?: string
  onClick?: () => void
  icon?: LucideIcon
  arrow?: boolean
  disabled?: boolean
  className?: string
  children: ReactNode
  title?: string
}

export function Btn({ variant = 'outline', size = 'md', to, onClick, icon: Icon, arrow, disabled, className, children, title }: BtnProps) {
  const cls = cx(
    'inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors duration-150 select-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    variants[variant],
    sizes[size],
    disabled && 'pointer-events-none opacity-50',
    className,
  )
  const inner = (
    <>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.75} className={variant === 'outline' ? 'text-gray-500' : ''} />}
      <span>{children}</span>
      {arrow && <span aria-hidden className="-mr-0.5 text-[1.05em] leading-none">→</span>}
    </>
  )
  if (to)
    return (
      <Link to={to} className={cls} title={title}>
        {inner}
      </Link>
    )
  return (
    <button type="button" onClick={onClick} className={cls} disabled={disabled} title={title}>
      {inner}
    </button>
  )
}

/** Small muted text link: "View all ›" */
export function MoreLink({ to, children, onClick }: { to?: string; children: ReactNode; onClick?: () => void }) {
  const cls = 'inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-900 transition-colors'
  const inner = (
    <>
      {children}
      <ChevronRight size={12} strokeWidth={2} />
    </>
  )
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}

/** Accent text link with chevron: "Connect ›", "Optimize ›" */
export function AccentLink({ to, children, onClick }: { to?: string; children: ReactNode; onClick?: () => void }) {
  const cls = 'inline-flex items-center gap-0.5 text-[13px] font-medium text-accent hover:text-accent-hover'
  const inner = (
    <>
      {children}
      <ChevronRight size={13} strokeWidth={2} />
    </>
  )
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}

// ── Layout ───────────────────────────────────────────────────────────────

/** Bordered frame; children separated by hairlines rather than cards. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx('rounded-lg border border-default bg-white', className)}>{children}</section>
}

export function SectionLabel({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-center justify-between gap-4', className)}>
      <h3 className="label-caps">{children}</h3>
      {right && <div className="flex items-center gap-4">{right}</div>}
    </div>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-sm border border-default bg-white px-1.5 font-mono text-[11px] text-gray-600 shadow-sm">
      {children}
    </kbd>
  )
}

export function KeyHints({ hints }: { hints: [string[], string][] }) {
  return (
    <div className="no-print flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-gray-500">
      {hints.map(([keys, label]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          {keys.map((k) => (
            <Kbd key={k}>{k}</Kbd>
          ))}
          <span className="ml-0.5">{label}</span>
        </span>
      ))}
    </div>
  )
}

// ── Data bits ────────────────────────────────────────────────────────────

type BadgeTone = 'neutral' | 'active' | 'done' | 'warn' | 'locked'

export function NumberBadge({ n, tone = 'neutral', size = 28 }: { n: number | string; tone?: BadgeTone; size?: number }) {
  const tones: Record<BadgeTone, string> = {
    neutral: 'bg-gray-100 text-gray-600',
    active: 'bg-accent-subtle text-accent',
    done: 'bg-accent text-white',
    warn: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    locked: 'bg-gray-75 text-gray-400',
  }
  return (
    <span
      className={cx('inline-flex shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-medium', tones[tone])}
      style={{ width: size, height: size }}
    >
      {tone === 'done' ? <Check size={size * 0.5} strokeWidth={2.5} /> : tone === 'locked' ? <Lock size={size * 0.42} /> : n}
    </span>
  )
}

export function Dot({ className }: { className: string }) {
  return <span className={cx('inline-block size-2 shrink-0 rounded-full', className)} />
}

export function CoverageBar({ covered, total, className, height = 8 }: { covered: number; total: number; className?: string; height?: number }) {
  const pct = Math.round((covered / total) * 100)
  return (
    <div className={cx('relative w-full overflow-hidden rounded-full bg-gray-100', className)} style={{ height }}>
      <div className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
    </div>
  )
}

/** trakkr's little vertical-bar cluster next to scores */
export function BarCluster({ value, bars = 7 }: { value: number; bars?: number }) {
  const lit = Math.max(1, Math.round((value / 100) * bars * 1.4))
  return (
    <span className="inline-flex h-4 items-end gap-[2px]" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} className={cx('w-[3px] rounded-[1px]', i < lit ? 'bg-accent' : 'bg-gray-200')} style={{ height: '100%' }} />
      ))}
    </span>
  )
}

export function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'warn' | 'error' | 'info' }) {
  const tones = {
    neutral: 'bg-gray-100 text-gray-700',
    accent: 'bg-accent-subtle text-accent',
    warn: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    error: 'bg-red-50 text-red-600',
    info: 'bg-blue-50 text-blue-500',
  }
  return <span className={cx('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>
}

export function CountPill({ n, active }: { n: number; active?: boolean }) {
  return (
    <span
      className={cx(
        'inline-flex min-w-[20px] items-center justify-center rounded-sm px-1.5 py-px font-mono text-[11px]',
        active ? 'bg-accent-subtle text-accent' : 'text-gray-500',
      )}
    >
      {n}
    </span>
  )
}

/** "All 50 · Threats 1 · Rising 1" filter pills */
export function PillTabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { id: T; label: string; count?: number }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {items.map((it) => {
        const active = it.id === value
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className={cx(
              'inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors',
              active ? 'bg-gray-75 font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            {it.label}
            {it.count !== undefined && <CountPill n={it.count} active={active} />}
          </button>
        )
      })}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-lg bg-gray-75">
        <Icon size={22} strokeWidth={1.5} className="text-gray-400" />
      </div>
      <p className="text-[15px] text-gray-800">{title}</p>
      {body && <p className="mt-1 text-[13px] text-gray-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Left-bordered note, like trakkr's "This brand has 1 day of history…" */
export function Note({ children }: { children: ReactNode }) {
  return <blockquote className="border-l-2 border-gray-300 py-1 pl-4 text-[15px] leading-relaxed text-gray-700">{children}</blockquote>
}
