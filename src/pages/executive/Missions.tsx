import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageTitle } from '../../components/shell/Chrome'
import { PlatformIcon } from '../../components/ui/PlatformIcon'
import { Btn, CoverageBar, Dot, KeyHints, NumberBadge, Panel, PillTabs, cx } from '../../components/ui/primitives'
import type { Mission, MissionStatus } from '../../data/types'
import { pad2, statusMeta } from '../../lib/format'
import { coverage, level, openMissions, verifiedMissions } from '../../state/reducer'
import { useStore } from '../../state/store'

type Filter = 'priority' | 'all' | MissionStatus

function MissionAction({ m }: { m: Mission }) {
  if (m.status === 'awaiting_approval')
    return (
      <Btn size="sm" to={`/executive/missions/team?highlight=${m.id}`} className="w-[140px]">
        Review blocker
      </Btn>
    )
  if (m.status === 'verified' || m.status === 'waiting')
    return (
      <Btn size="sm" to={`/executive/missions/${m.id}`} className="w-[140px]">
        View
      </Btn>
    )
  return (
    <Btn size="sm" variant="primary" to={`/executive/missions/${m.id}`} className="w-[140px]">
      {m.status === 'pending_recheck' ? 'Run recheck' : 'Open mission'}
    </Btn>
  )
}

export default function Missions() {
  const { state } = useStore()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const filter = (params.get('status') ?? 'priority') as Filter
  const [focus, setFocus] = useState(-1)

  const verified = verifiedMissions(state).length
  const total = state.missions.length
  const lvl = level(verified)
  const open = openMissions(state)
  const count = (s: MissionStatus) => state.missions.filter((m) => m.status === s).length

  const rows =
    filter === 'priority'
      ? open.slice(0, 3)
      : filter === 'all'
        ? [...state.missions].sort((a, b) => a.number - b.number)
        : state.missions.filter((m) => m.status === filter)

  const setFilter = (f: Filter) => {
    setParams(f === 'priority' ? {} : { status: f }, { replace: true })
    setFocus(-1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'j') setFocus((f) => Math.min(rows.length - 1, f + 1))
      if (e.key === 'k') setFocus((f) => Math.max(0, f - 1))
      if (e.key === 'Enter' && rows[focus]) nav(`/executive/missions/${rows[focus].id}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [rows, focus, nav])

  return (
    <>
      <PageTitle
        title="Guided Missions"
        subtitle="Complete the work that improves your visibility."
        right={
          <Btn to="/executive/missions/team" arrow>
            Who is doing what
          </Btn>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Panel className="flex flex-col justify-center px-7 py-6">
          <div className="flex items-baseline justify-between">
            <Link to="/executive/missions?status=verified" className="text-[21px] font-semibold tracking-tight hover:underline hover:decoration-gray-300 hover:underline-offset-4">
              <span className="font-mono">{verified}</span> of <span className="font-mono">{total}</span> missions verified
            </Link>
            <span className="text-[13px] text-gray-500">
              Level {lvl.n} · {lvl.name}
            </span>
          </div>
          <CoverageBar covered={verified} total={total} height={22} className="mt-5 rounded-md [&>div]:rounded-md" />
          <span className="mt-2.5 font-mono text-[13px] text-gray-500">{Math.round((verified / total) * 100)}% complete</span>
        </Panel>

        <Panel className="px-7 py-5">
          <div className="text-[15px] font-medium text-gray-900">Coverage of tracked buying prompts</div>
          <ul className="mt-2">
            {state.platforms.map((p) => {
              const c = coverage(state, p.id)
              return (
                <li key={p.id}>
                  <Link to={`/executive/platforms/${p.id}`} className="-mx-2 grid grid-cols-[150px_1fr_48px] items-center gap-4 rounded-md px-2 py-1.5 hover:bg-gray-50">
                    <span className="flex items-center gap-2 text-[15px] text-gray-800">
                      <PlatformIcon id={p.id} size={13} />
                      {p.name}
                    </span>
                    <CoverageBar covered={c.covered} total={c.total} height={10} />
                    <span className="text-right font-mono text-[13px] text-gray-600">
                      {c.covered}/{c.total}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-5">
        <div className="flex flex-wrap items-end justify-between gap-4 px-7 pt-6">
          <div>
            <h2 className="text-[21px] font-semibold tracking-tight">{filter === 'priority' ? 'Priority missions' : 'Missions'}</h2>
            <p className="mt-1 text-sm text-gray-500">
              <span className="font-medium text-gray-700">Why these missions?</span> They address the largest verified gaps in current AI answers.
            </p>
          </div>
          <PillTabs<Filter>
            value={filter}
            onChange={setFilter}
            items={[
              { id: 'priority', label: 'Priority', count: Math.min(3, open.length) },
              { id: 'all', label: 'All', count: total },
              { id: 'ready', label: 'Ready', count: count('ready') },
              { id: 'in_progress', label: 'In progress', count: count('in_progress') },
              { id: 'awaiting_approval', label: 'Blocked', count: count('awaiting_approval') },
              { id: 'pending_recheck', label: 'Recheck', count: count('pending_recheck') },
              { id: 'verified', label: 'Verified', count: verified },
            ]}
          />
        </div>
        <div className="px-7 pb-2 pt-4">
          <table className="w-full text-left">
            <thead>
              <tr className="label-caps border-b border-default">
                <th className="w-[80px] py-3 font-medium">#</th>
                <th className="py-3 font-medium">Mission</th>
                <th className="w-[260px] py-3 font-medium">Status</th>
                <th className="w-[150px] py-3 font-medium">Owner</th>
                <th className="w-[120px] py-3 font-medium">Effort</th>
                <th className="w-[150px] py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-default">
              {rows.map((m, i) => {
                const s = statusMeta(m, 'missions')
                return (
                  <tr
                    key={m.id}
                    onClick={() => nav(`/executive/missions/${m.id}`)}
                    className={cx('cursor-pointer transition-colors hover:bg-gray-50', focus === i && 'bg-gray-75 ring-1 ring-inset ring-accent')}
                  >
                    <td className="py-3">
                      <NumberBadge n={pad2(m.number)} tone={m.status === 'verified' ? 'done' : 'active'} size={36} />
                    </td>
                    <td className="py-3 text-[15px] text-gray-900">{m.title}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-2.5 text-[15px] text-gray-800">
                        <Dot className={cx(s.dot, 'size-2.5')} />
                        {s.label}
                      </span>
                    </td>
                    <td className="py-3 text-[15px] text-gray-500">{m.department}</td>
                    <td className="py-3 font-mono text-[13px] text-gray-500">{m.effort}</td>
                    <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <MissionAction m={m} />
                    </td>
                  </tr>
                )
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-500">
                    No missions with this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-default px-7 py-3">
          <KeyHints hints={[[['j', 'k'], 'walk'], [['↵'], 'open']]} />
          {filter === 'priority' && (
            <button type="button" onClick={() => setFilter('all')} className="text-xs text-gray-500 hover:text-gray-900">
              View all {total} missions ›
            </button>
          )}
        </div>
      </Panel>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Btn size="lg" to="/executive" arrow>
          Back to Executive Overview
        </Btn>
        <Btn size="lg" to="/executive/evidence" arrow>
          See all evidence
        </Btn>
      </div>
    </>
  )
}
