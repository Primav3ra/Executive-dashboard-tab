import { FileText, Share2, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { TODAY } from '../../data/seed'
import { fmtLong } from '../../lib/format'
import { verifiedMissions } from '../../state/reducer'
import { useStore } from '../../state/store'
import { MenuButton } from '../ui/overlays'
import { cx } from '../ui/primitives'

/** Top bar of the Executive tab: tabs on the left, data freshness + actions on the right. */
export function ExecHeader() {
  const { toast } = useStore()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const section = pathname.startsWith('/executive/missions') ? 'missions' : pathname.startsWith('/executive/expert') ? 'expert' : 'overview'
  const tabs = [
    { id: 'overview', to: '/executive', label: 'Executive Overview' },
    { id: 'missions', to: '/executive/missions', label: 'Guided Missions' },
    { id: 'expert', to: '/executive/expert', label: 'Expert View' },
  ]
  const copy = (what: string) => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {})
    toast(`${what} link copied`)
  }
  return (
    <header className="no-print sticky top-0 z-20 flex h-[70px] items-stretch justify-between border-b border-default bg-white/95 pl-10 pr-6 backdrop-blur">
      <nav className="flex items-stretch gap-8" aria-label="Executive views">
        {tabs.map((t) => {
          const isActive = t.id === section
          return (
            <Link
              key={t.to}
              to={t.to}
              aria-current={isActive ? 'page' : undefined}
              className={cx(
                'relative flex items-center text-[15px] transition-colors',
                isActive ? 'font-medium text-accent' : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {t.label}
              {isActive && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t bg-accent" />}
            </Link>
          )
        })}
      </nav>
      <div className="flex items-center gap-3">
        <span className="mr-2 text-[13px] text-gray-500">
          Demo account · Illustrative data · Data through {fmtLong(TODAY)}
        </span>
        <MenuButton
          items={[
            { label: 'Copy read-only link', hint: 'Anyone with the link can view', onClick: () => copy('Read-only') },
            { label: 'Email to leadership', hint: 'Sends a weekly summary', onClick: () => toast('Weekly summary scheduled for Mondays') },
          ]}
        >
          <Share2 size={15} strokeWidth={1.75} className="text-gray-500" /> Share
        </MenuButton>
        <MenuButton
          items={[
            { label: 'Executive report', hint: 'PDF, one page', onClick: () => nav('/executive/report') },
            { label: 'Evidence log', hint: 'Every observed answer', onClick: () => nav('/executive/evidence') },
          ]}
        >
          <FileText size={15} strokeWidth={1.75} className="text-gray-500" /> Reports
        </MenuButton>
      </div>
    </header>
  )
}

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-[13px] text-gray-500">
      {items.map((it, i) => (
        <span key={it.label} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-300">/</span>}
          {it.to ? (
            <Link to={it.to} className="hover:text-gray-900">
              {it.label}
            </Link>
          ) : (
            <span className="text-gray-700">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export function PageTitle({ title, subtitle, right, children }: { title: ReactNode; subtitle?: ReactNode; right?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-6">
      <div>
        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.025em] text-gray-900">{title}</h1>
        {children}
        {subtitle && <p className="mt-1.5 text-[17px] text-gray-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

/** trakkr's floating "Setup 3/7" pill, repurposed for mission progress. */
export function MissionPill() {
  const { state } = useStore()
  const done = verifiedMissions(state).length
  const total = state.missions.length
  return (
    <Link
      to="/executive/missions"
      className="no-print fixed bottom-5 right-6 z-30 flex items-center gap-3 rounded-lg border border-default bg-white px-4 py-2.5 shadow-md hover:border-hover"
    >
      <span className="text-[15px] font-medium text-gray-900">Missions</span>
      <span className="h-1 w-12 overflow-hidden rounded-full bg-gray-100">
        <span className="block h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${(done / total) * 100}%` }} />
      </span>
      <span className="font-mono text-[13px] text-gray-600">
        {done}/{total}
      </span>
    </Link>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useStore()
  return (
    <div className="no-print fixed bottom-20 right-6 z-50 flex flex-col items-end gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="animate-toast flex items-center gap-3 rounded-lg bg-gray-900 py-2.5 pl-4 pr-2.5 text-sm text-white shadow-overlay">
          <span className="size-1.5 rounded-full bg-green-100" />
          <span>{t.text}</span>
          {t.href && (
            <Link to={t.href} onClick={() => dismiss(t.id)} className="font-medium text-green-100 hover:underline">
              {t.hrefLabel ?? 'View'}
            </Link>
          )}
          <button type="button" onClick={() => dismiss(t.id)} className="rounded p-0.5 text-gray-400 hover:text-white" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
