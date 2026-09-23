import { Check, ChevronRight, Minus } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Breadcrumb, PageTitle } from '../../components/shell/Chrome'
import { PlatformIcon } from '../../components/ui/PlatformIcon'
import { Btn, CoverageBar, NumberBadge, Panel, PillTabs, SectionLabel, cx } from '../../components/ui/primitives'
import { TrendChart } from '../../components/ui/TrendChart'
import { BRAND } from '../../data/seed'
import type { PlatformId } from '../../data/types'
import { useHighlight } from '../../lib/useHighlight'
import { coverage, platformSeries } from '../../state/reducer'
import { useStore } from '../../state/store'

type PromptFilter = 'all' | 'appears' | 'missing'

export default function PlatformDetail() {
  const { platform } = useParams()
  const { state } = useStore()
  const highlight = useHighlight()
  const [filter, setFilter] = useState<PromptFilter>('all')
  const p = state.platforms.find((x) => x.id === platform)
  if (!p) return <Navigate to="/executive/platforms/chatgpt" replace />
  const id = p.id as PlatformId
  const c = coverage(state, id)
  const pct = Math.round((c.covered / c.total) * 100)
  const notWorking = state.evidence.filter((e) => e.platformId === id && !e.resolved)
  const improve = state.missions
    .filter((m) => m.platformIds.includes(id) && m.status !== 'verified' && m.evidenceIds.length)
    .sort((a, b) => a.number - b.number)
  const prompts = state.prompts.filter((pr) =>
    filter === 'all' ? true : filter === 'appears' ? pr.appearsOn.includes(id) : !pr.appearsOn.includes(id),
  )

  return (
    <>
      <Breadcrumb items={[{ label: 'Executive Overview', to: '/executive' }, { label: 'Platform detail' }]} />
      <PageTitle title="AI platform visibility" />

      <div className="-mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {state.platforms.map((x) => {
          const cc = coverage(state, x.id)
          const active = x.id === id
          return (
            <Link
              key={x.id}
              to={`/executive/platforms/${x.id}`}
              className={cx(
                'flex h-14 items-center justify-between rounded-lg border px-5 transition-colors',
                active ? 'border-accent bg-accent-subtle/60 ring-1 ring-accent' : 'border-default bg-white hover:border-hover hover:bg-gray-50',
              )}
            >
              <span className={cx('flex items-center gap-2.5 text-[16px]', active ? 'font-medium text-gray-900' : 'text-gray-800')}>
                <PlatformIcon id={x.id} size={16} />
                {x.name}
              </span>
              <span className={cx('font-mono text-sm', active ? 'text-accent' : 'text-gray-500')}>
                {cc.covered}/{cc.total}
              </span>
            </Link>
          )
        })}
      </div>
      <p className="mt-3 text-[13px] text-gray-500">Tracked buying prompts where {BRAND} appears. Coverage is not a quality score.</p>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel className="p-7">
          <h2 className="text-[30px] font-semibold tracking-tight">{p.name}</h2>
          <p className="mt-1 text-[17px] text-gray-900">
            <span className="font-mono font-medium">{c.covered}</span> of <span className="font-mono">{c.total}</span>{' '}
            <span className="text-gray-500">prompts</span>
          </p>
          <div className="mt-3 flex items-center gap-4">
            <CoverageBar covered={c.covered} total={c.total} height={12} />
            <span className="w-10 text-right font-mono text-sm text-gray-600">{pct}%</span>
          </div>
          <div className="mt-6 border-t border-default pt-5">
            <SectionLabel>Coverage over time</SectionLabel>
            <div className="mt-3">
              <TrendChart data={platformSeries(state, id)} height={150} unit="%" ariaLabel={`${p.name} coverage over time`} />
            </div>
          </div>
          <div className="mt-5 border-t border-default pt-5">
            <SectionLabel right={<Link to={`/executive/evidence?platform=${id}`} className="text-xs text-gray-500 hover:text-gray-900">Evidence ›</Link>}>
              What is not working
            </SectionLabel>
            {notWorking.length ? (
              <ul className="mt-2 divide-y divide-default">
                {notWorking.map((e, i) => (
                  <li key={e.id}>
                    <Link to={`/executive/evidence?highlight=${e.id}`} className="group -mx-2 flex items-center gap-4 rounded-md px-2 py-3 hover:bg-gray-50">
                      <NumberBadge n={i + 1} tone="warn" />
                      <span className="flex-1 text-[15px] text-gray-800">{e.title}</span>
                      <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-gray-500">Nothing open on {p.name}.</p>
            )}
          </div>
        </Panel>

        <Panel className="flex flex-col p-7">
          <h2 className="text-[24px] font-semibold tracking-tight">How to improve</h2>
          <p className="mt-1 text-[15px] text-gray-500">Recommended actions to build visibility on {p.name}.</p>
          <ul className="mt-4 divide-y divide-default border-b border-default">
            {improve.map((m, i) => (
              <li key={m.id} className="flex items-start gap-4 py-5">
                <NumberBadge n={i + 1} tone="active" size={34} />
                <div className="flex-1">
                  <Link to={`/executive/missions/${m.id}`} className="text-[16px] text-gray-900 hover:underline hover:decoration-gray-300 hover:underline-offset-4">
                    {m.title}
                  </Link>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{m.summary}</p>
                </div>
                <div className="flex w-[150px] shrink-0 flex-col items-start gap-1">
                  <span className="text-xs text-gray-500">Owner</span>
                  <span className="text-sm text-gray-800">{m.department}</span>
                  <Btn size="sm" to={`/executive/missions/${m.id}`} arrow className="mt-2">
                    Open mission
                  </Btn>
                </div>
              </li>
            ))}
            {!improve.length && <li className="py-6 text-sm text-gray-500">No open missions for {p.name}.</li>}
          </ul>
          <div className="mt-5">
            <Btn to={`/executive/evidence?platform=${id}`} arrow>
              Explore source evidence
            </Btn>
          </div>
        </Panel>
      </div>

      <Panel className="mt-5">
        <div className="flex items-center justify-between border-b border-default px-7 py-4">
          <SectionLabel>Tracked prompts on {p.name}</SectionLabel>
          <PillTabs<PromptFilter>
            value={filter}
            onChange={setFilter}
            items={[
              { id: 'all', label: 'All', count: c.total },
              { id: 'appears', label: 'Appears', count: c.covered },
              { id: 'missing', label: 'Missing', count: c.total - c.covered },
            ]}
          />
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="label-caps border-b border-default">
              <th className="w-14 px-7 py-3 font-medium">#</th>
              <th className="py-3 font-medium">Prompt</th>
              <th className="w-28 py-3 font-medium">Volume</th>
              <th className="w-44 px-7 py-3 text-right font-medium">{BRAND} appears</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default">
            {prompts.map((pr) => {
              const n = state.prompts.indexOf(pr) + 1
              const appears = pr.appearsOn.includes(id)
              const ev = state.evidence.find((e) => e.promptId === pr.id && e.platformId === id && !e.resolved)
              return (
                <tr key={pr.id} id={`row-${pr.id}`} className={cx('hover:bg-gray-50', highlight === pr.id && 'is-highlighted')}>
                  <td className="px-7 py-3 font-mono text-[13px] text-gray-400">{n}</td>
                  <td className="py-3 text-[15px] text-gray-800">
                    {pr.text}
                    {ev && (
                      <Link to={`/executive/evidence?highlight=${ev.id}`} className="ml-3 text-xs text-amber-700 hover:underline">
                        {ev.badge} ›
                      </Link>
                    )}
                  </td>
                  <td className="py-3 font-mono text-[13px] text-gray-600">{pr.volume}</td>
                  <td className="px-7 py-3 text-right">
                    {appears ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-accent">
                        <Check size={15} strokeWidth={2.25} /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                        <Minus size={15} /> No
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Panel>
    </>
  )
}
