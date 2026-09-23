import { CircleCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApprovalModal } from '../../components/ApprovalModal'
import { Breadcrumb, PageTitle } from '../../components/shell/Chrome'
import { Btn, Dot, Panel, cx } from '../../components/ui/primitives'
import type { Mission } from '../../data/types'
import { statusMeta } from '../../lib/format'
import { useHighlight } from '../../lib/useHighlight'
import { currentStep, openMissions, teamCounts } from '../../state/reducer'
import { useStore } from '../../state/store'

type Filter = 'active' | 'awaiting' | 'recheck' | null

export default function TeamWork() {
  const { state } = useStore()
  const highlight = useHighlight()
  const [filter, setFilter] = useState<Filter>(null)
  const [reviewing, setReviewing] = useState<Mission | null>(null)
  const counts = teamCounts(state)
  const decisions = state.missions.filter((m) => m.status === 'awaiting_approval')

  const rows = openMissions(state).filter((m) => {
    if (filter === 'active') return m.started && ['ready', 'in_progress', 'awaiting_approval'].includes(m.status)
    if (filter === 'awaiting') return m.status === 'awaiting_approval'
    if (filter === 'recheck') return m.status === 'pending_recheck'
    return true
  })

  const cells: { id: Exclude<Filter, null>; n: number; label: string; color: string }[] = [
    { id: 'active', n: counts.active, label: 'active missions', color: 'text-accent' },
    { id: 'awaiting', n: counts.awaiting, label: 'awaiting approval', color: 'text-red-500' },
    { id: 'recheck', n: counts.recheck, label: 'outcome pending recheck', color: 'text-blue-500' },
  ]

  const nextActionFor = (m: Mission) => {
    const cur = currentStep(m)
    if (m.status === 'awaiting_approval') return cur?.title.replace(/^Approve the/, 'Approve') ?? ''
    if (m.status === 'waiting' || !m.started) return m.title
    return cur?.title ?? m.title
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Guided Missions', to: '/executive/missions' }, { label: 'Team work' }]} />
      <PageTitle title="Who is doing what" subtitle="One accountable owner per action, with blockers visible to leadership." />

      <Panel className="-mt-2 grid grid-cols-3 divide-x divide-default">
        {cells.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter((f) => (f === c.id ? null : c.id))}
            className={cx('flex items-center gap-5 px-9 py-5 text-left transition-colors hover:bg-gray-50', filter === c.id && 'bg-gray-75')}
          >
            <span className={cx('font-mono text-[40px] font-medium leading-none', c.color)}>{c.n}</span>
            <span className="text-[17px] text-gray-700">{c.label}</span>
            {filter === c.id && <span className="ml-auto text-xs text-gray-500">Filtered ×</span>}
          </button>
        ))}
      </Panel>

      <Panel className="mt-5 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="label-caps border-b border-default bg-gray-50">
              <th className="px-6 py-3.5 font-medium">Department</th>
              <th className="py-3.5 font-medium">Next action</th>
              <th className="py-3.5 font-medium">Owner</th>
              <th className="py-3.5 font-medium">Status</th>
              <th className="py-3.5 font-medium">Due</th>
              <th className="px-6 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-default">
            {rows.map((m) => {
              const s = statusMeta(m, 'team')
              return (
                <tr key={m.id} id={`row-${m.id}`} className={cx('hover:bg-gray-50', highlight === m.id && 'is-highlighted')}>
                  <td className="px-6 py-3.5 text-[15px] text-gray-900">{m.department}</td>
                  <td className="py-3.5 text-[15px] text-gray-900">{nextActionFor(m)}</td>
                  <td className="py-3.5 text-[15px] text-gray-500">{m.owner}</td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-2.5 text-[15px] text-gray-800">
                      <Dot className={cx(s.dot, 'size-2.5')} /> {s.label}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-[13px] text-gray-600">{m.due}</td>
                  <td className="px-6 py-3.5 text-right">
                    <Link to={`/executive/missions/${m.id}`} className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent hover:text-accent-hover">
                      Open mission <span aria-hidden>→</span>
                    </Link>
                  </td>
                </tr>
              )
            })}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-gray-500">
                  Nothing here right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>

      <div className="mt-5 flex flex-col gap-3">
        {decisions.map((m) => (
          <div key={m.id} className="flex items-center gap-6 rounded-lg border border-amber-200 bg-amber-50 px-7 py-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xl font-semibold text-white">!</span>
            <div className="flex-1">
              <div className="text-[19px] font-semibold tracking-tight">Decision needed</div>
              <div className="text-[15px] text-gray-600">{m.decisionAsk ?? `Approve “${currentStep(m)?.title}” to unblock ${m.department}.`}</div>
            </div>
            <Btn size="lg" variant="primary" onClick={() => setReviewing(m)} className="w-[180px]">
              Review approval
            </Btn>
          </div>
        ))}
        {!decisions.length && (
          <div className="flex items-center gap-4 rounded-lg border border-default bg-accent-subtle/50 px-7 py-5">
            <CircleCheck size={22} className="text-accent" />
            <div className="text-[15px] text-gray-700">No decisions waiting on leadership.</div>
          </div>
        )}
      </div>

      <Btn size="lg" to="/executive/missions?status=all" arrow className="mt-5 w-full">
        View all missions
      </Btn>

      <ApprovalModal mission={reviewing} onClose={() => setReviewing(null)} />
    </>
  )
}
