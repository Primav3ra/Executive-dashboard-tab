import { CircleCheck, ExternalLink, Info, Search, SearchX } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Breadcrumb, PageTitle } from '../../components/shell/Chrome'
import { Drawer, Dropdown } from '../../components/ui/overlays'
import { PlatformIcon } from '../../components/ui/PlatformIcon'
import { Btn, Chip, EmptyState, KeyHints, NumberBadge, cx } from '../../components/ui/primitives'
import { TODAY } from '../../data/seed'
import type { Evidence as Ev, IssueType, PlatformId } from '../../data/types'
import { ISSUE_LABEL, daysBetween, fmtLong } from '../../lib/format'
import { useHighlight } from '../../lib/useHighlight'
import { useStore } from '../../state/store'

type Period = '7' | '30' | '90'

export default function Evidence() {
  const { state } = useStore()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const highlight = useHighlight()
  const platform = (params.get('platform') ?? 'all') as PlatformId | 'all'
  const issue = (params.get('issue') ?? 'all') as IssueType | 'all'
  const period = (params.get('period') ?? (highlight ? '90' : '30')) as Period
  const q = params.get('q') ?? ''
  const [source, setSource] = useState<Ev | null>(null)
  const [focus, setFocus] = useState(-1)
  const searchRef = useRef<HTMLInputElement>(null)

  const set = (k: string, v: string, dflt: string) => {
    const next = new URLSearchParams(params)
    if (v === dflt) next.delete(k)
    else next.set(k, v)
    next.delete('highlight')
    setParams(next, { replace: true })
  }

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return state.evidence.filter((e) => {
      if (platform !== 'all' && e.platformId !== platform) return false
      if (issue !== 'all' && e.issue !== issue) return false
      if (daysBetween(e.observed, TODAY) > Number(period)) return false
      if (needle) {
        const prompt = state.prompts.find((p) => p.id === e.promptId)?.text ?? ''
        const hay = [e.title, e.answer, prompt, e.source.label, ...(e.source.pages ?? [])].join(' ').toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
  }, [state, platform, issue, period, q])

  // trakkr keyboard walk: j/k move, enter opens mission, / focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') {
        if (e.key === 'Escape') (e.target as HTMLInputElement).blur()
        return
      }
      if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (e.key === 'j' || e.key === 'k') {
        setFocus((f) => {
          const n = Math.min(items.length - 1, Math.max(0, f + (e.key === 'j' ? 1 : -1)))
          document.getElementById(`row-${items[n]?.id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          return n
        })
      } else if (e.key === 'Enter' && items[focus]) {
        nav(`/executive/missions/${items[focus].missionId}`)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items, focus, nav])

  const platformName = (id: PlatformId) => state.platforms.find((p) => p.id === id)!.name

  return (
    <>
      <Breadcrumb items={[{ label: 'Executive Overview', to: '/executive' }, { label: 'Evidence' }]} />
      <PageTitle title="Explore the evidence" subtitle="Every recommendation is tied to an observed AI answer or source." />

      <div className="-mt-2 flex flex-wrap items-center gap-3">
        <Dropdown
          className="w-[240px]"
          label="Platform"
          value={platform}
          onChange={(v) => set('platform', v, 'all')}
          options={[{ id: 'all', label: 'All' }, ...state.platforms.map((p) => ({ id: p.id, label: p.name }))]}
        />
        <Dropdown
          className="w-[240px]"
          label="Issue"
          value={issue}
          onChange={(v) => set('issue', v, 'all')}
          options={[{ id: 'all' as const, label: 'All' }, ...(Object.keys(ISSUE_LABEL) as IssueType[]).map((k) => ({ id: k, label: ISSUE_LABEL[k] }))]}
        />
        <Dropdown
          className="w-[240px]"
          label="Period"
          value={period}
          onChange={(v) => set('period', v, '30')}
          options={[
            { id: '7', label: 'Last 7 days' },
            { id: '30', label: 'Last 30 days' },
            { id: '90', label: 'Last 90 days' },
          ]}
        />
        <label className="relative flex-1 min-w-[200px]">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchRef}
            value={q}
            onChange={(e) => set('q', e.target.value, '')}
            placeholder="Search evidence…"
            className="h-10 w-full rounded-md border border-default bg-white pl-10 pr-3 text-sm shadow-sm outline-none placeholder:text-gray-400 hover:border-hover focus:border-accent focus:ring-2 focus:ring-accent-subtle"
          />
        </label>
        <span className="ml-auto font-mono text-[13px] text-gray-500">{fmtLong(TODAY)} scan</span>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {items.map((e, i) => {
          const prompt = state.prompts.find((p) => p.id === e.promptId)!
          const mission = state.missions.find((m) => m.id === e.missionId)!
          return (
            <article
              key={e.id}
              id={`row-${e.id}`}
              className={cx(
                'rounded-lg border bg-white transition-colors',
                focus === i ? 'border-accent ring-1 ring-accent' : 'border-default',
                highlight === e.id && 'is-highlighted',
              )}
            >
              <div className="flex items-center gap-4 px-6 pt-5">
                <NumberBadge n={i + 1} tone={e.resolved ? 'done' : 'warn'} size={32} />
                <h2 className="text-[19px] font-semibold tracking-tight">{e.title}</h2>
                {e.resolved ? (
                  <Chip tone="accent">
                    <CircleCheck size={12} /> Resolved
                  </Chip>
                ) : (
                  <Chip tone="warn">{e.badge}</Chip>
                )}
              </div>
              <dl className="ml-[68px] mr-6 mt-3 grid grid-cols-[160px_210px_1fr] divide-x divide-default pb-4">
                <div className="pr-6">
                  <dt className="text-[13px] text-gray-500">Platform</dt>
                  <dd className="mt-0.5">
                    <Link to={`/executive/platforms/${e.platformId}`} className="inline-flex items-center gap-2 text-[15px] text-gray-900 hover:underline hover:decoration-gray-300 hover:underline-offset-4">
                      <PlatformIcon id={e.platformId} size={13} /> {platformName(e.platformId)}
                    </Link>
                  </dd>
                </div>
                <div className="px-6">
                  <dt className="text-[13px] text-gray-500">Observed</dt>
                  <dd className="mt-0.5 font-mono text-[14px] text-gray-900">{fmtLong(e.observed)}</dd>
                </div>
                <div className="pl-6">
                  <dt className="text-[13px] text-gray-500">Tracked prompt</dt>
                  <dd className="mt-0.5">
                    <Link
                      to={`/executive/platforms/${e.platformId}?highlight=${prompt.id}`}
                      className="text-[15px] text-gray-900 hover:underline hover:decoration-gray-300 hover:underline-offset-4"
                    >
                      {prompt.text}
                    </Link>
                  </dd>
                </div>
              </dl>
              <div className="grid grid-cols-1 gap-6 border-t border-default px-6 py-5 lg:grid-cols-[1.35fr_0.75fr_1.2fr]">
                <div>
                  <div className="text-[13px] text-gray-500">Observed answer (illustrative)</div>
                  <blockquote className="mt-2 rounded-md bg-accent-subtle/70 px-4 py-3 text-[15px] text-gray-900">“{e.answer}”</blockquote>
                </div>
                <div className="lg:border-l lg:border-default lg:pl-6">
                  <div className="text-[13px] text-gray-500">Source</div>
                  <button type="button" onClick={() => setSource(e)} className="mt-1 text-left text-[15px] text-gray-900 hover:underline hover:decoration-gray-300 hover:underline-offset-4">
                    {e.source.label}
                  </button>
                  <div className="mt-0.5 font-mono text-[11px] text-gray-400">{e.source.url}</div>
                </div>
                <div className="lg:border-l lg:border-default lg:pl-6">
                  <div className="flex gap-2.5">
                    <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
                    <div>
                      <div className="text-[13px] text-gray-500">Recommended action</div>
                      <p className="mt-0.5 text-[15px] leading-snug text-gray-800">{e.recommendation}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Btn onClick={() => setSource(e)} arrow className="flex-1">
                      Open source
                    </Btn>
                    <Btn to={`/executive/missions/${mission.id}`} arrow className="flex-1">
                      Open mission
                    </Btn>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
        {!items.length && (
          <div className="rounded-lg border border-default">
            <EmptyState
              icon={SearchX}
              title="No evidence matches these filters"
              body="Try a longer period or clear the filters."
              action={
                <Btn variant="soft" to="/executive/evidence?period=90">
                  Clear filters
                </Btn>
              }
            />
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-6 text-[13px] text-gray-500">
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-accent-subtle ring-1 ring-accent-muted" /> Observed answer
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-amber-50 ring-1 ring-amber-200" /> Recommended action
          </span>
          <span className="font-mono text-gray-400">
            {items.length} of {state.evidence.length}
          </span>
        </div>
        <KeyHints hints={[[['j', 'k'], 'walk'], [['↵'], 'open mission'], [['/'], 'search']]} />
      </div>

      <Drawer open={!!source} onClose={() => setSource(null)} title={source?.source.label ?? ''}>
        {source && (
          <div className="space-y-6">
            <div>
              <div className="label-caps">Type</div>
              <div className="mt-1 text-[15px] capitalize text-gray-900">{source.source.kind.replace('_', ' ')} source</div>
            </div>
            <div>
              <div className="label-caps">What we found</div>
              <p className="mt-1 text-[15px] leading-relaxed text-gray-800">{source.source.detail}</p>
            </div>
            <div>
              <div className="label-caps">Cited pages</div>
              <ul className="mt-2 divide-y divide-default rounded-md border border-default">
                {(source.source.pages ?? [source.source.url]).map((pg) => (
                  <li key={pg} className="flex items-center justify-between px-3.5 py-2.5">
                    <span className="font-mono text-[13px] text-gray-700">{pg}</span>
                    <ExternalLink size={13} className="text-gray-400" />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="label-caps">Seen in</div>
              <p className="mt-1 text-[15px] text-gray-800">
                {platformName(source.platformId)} · <span className="font-mono">{fmtLong(source.observed)}</span>
              </p>
            </div>
            <Btn variant="primary" to={`/executive/missions/${source.missionId}`} arrow className="w-full">
              Open mission
            </Btn>
          </div>
        )}
      </Drawer>
    </>
  )
}
