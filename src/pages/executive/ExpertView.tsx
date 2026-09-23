import { Brain, ChartNoAxesColumn, ChevronRight, Info, Wrench } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PlatformIcon } from '../../components/ui/PlatformIcon'
import { AccentLink, BarCluster, Btn, EmptyState, MoreLink, SectionLabel, cx } from '../../components/ui/primitives'
import { TrendChart } from '../../components/ui/TrendChart'
import { BRAND, CITATION_WEEK, COMPETITORS, EXPERT_KPIS, SOURCES, TODAY } from '../../data/seed'
import { fmtDay, fmtShort } from '../../lib/format'
import { coverage, visibilitySeries } from '../../state/reducer'
import { useStore } from '../../state/store'

function Kpi({ label, value, sub, to, active, muted }: { label: string; value: ReactNode; sub: string; to: string; active?: boolean; muted?: boolean }) {
  return (
    <Link to={to} className={cx('group flex flex-col px-6 py-6 transition-colors hover:bg-gray-50', active && 'bg-gray-75')}>
      <span className="label-caps flex items-center gap-1.5">
        {label} <Info size={12} className="text-gray-400" />
      </span>
      <span className={cx('mt-3 font-mono text-[28px] font-medium leading-none', muted ? 'text-gray-300' : 'text-gray-900')}>{value}</span>
      <span className="mt-2 text-[11px] text-gray-500 group-hover:text-gray-700">{sub}</span>
    </Link>
  )
}

type Range = '7D' | '30D' | '90D'

export default function ExpertView() {
  const { state } = useStore()
  const [range, setRange] = useState<Range>('90D')
  const full = visibilitySeries(state)
  const vis = full[full.length - 1].value
  const series = range === '7D' ? full.slice(-2) : range === '30D' ? full.slice(-5) : full

  const ranking = [...COMPETITORS, { name: BRAND, score: vis, mentions: EXPERT_KPIS.mentions, isYou: true }].sort((a, b) => b.score - a.score)
  const rank = ranking.findIndex((r) => r.isYou) + 1
  const topPrompts = [...state.prompts].sort((a, b) => b.score - a.score).slice(0, 5)
  const maxCite = Math.max(...CITATION_WEEK)

  return (
    <div className="-mx-10 -mt-9">
      {/* KPI strip */}
      <div className="grid grid-cols-3 divide-x divide-default border-b border-default xl:grid-cols-6">
        <Kpi label="Visibility" value={vis} sub="mean coverage, latest scan" to="/executive/platforms/chatgpt" active />
        <Kpi label="Mentions" value={EXPERT_KPIS.mentions} sub="last 7 days" to="/executive/evidence" />
        <Kpi
          label="Rank"
          value={
            <>
              #{rank} <span className="text-[15px] text-gray-500">of {EXPERT_KPIS.brandsTracked}</span>
            </>
          }
          sub="Latest scan"
          to="/executive/expert#rankings"
        />
        <Kpi label="Citations" value={EXPERT_KPIS.citations} sub="this week" to="/executive/evidence?period=7" />
        <Kpi label="AI traffic" value="– –" sub="Connect GA" to="/integrations" muted />
        <Kpi label="Conversations" value="– –" sub="Connect AI crawlers" to="/connect" muted />
      </div>
      <div className="flex items-center gap-4 border-b border-default px-6 py-2.5 text-xs text-gray-500">
        <span>
          Latest run · <span className="font-mono">{fmtShort(TODAY)}</span>
        </span>
        <span>{state.prompts.length} prompts × 4 models</span>
      </div>

      {/* Visibility over time + rankings */}
      <div className="grid grid-cols-1 divide-default border-b border-default lg:grid-cols-[1fr_520px] lg:divide-x">
        <section id="visibility" className="px-10 py-8">
          <SectionLabel
            right={
              <div className="flex gap-1">
                {(['7D', '30D', '90D'] as Range[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={cx(
                      'h-8 rounded-md px-2.5 font-mono text-[13px]',
                      range === r ? 'bg-accent-subtle font-medium text-accent ring-1 ring-green-100' : 'text-gray-500 hover:bg-gray-50',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            }
          >
            Visibility over time
          </SectionLabel>
          <div className="mt-6">
            <TrendChart data={series} height={330} unit="%" yTicks={3} ariaLabel="Visibility over time" />
          </div>
        </section>
        <section id="rankings" className="py-8">
          <SectionLabel className="px-8" right={<MoreLink to="/executive/evidence?issue=absence">Where you lose</MoreLink>}>
            Rankings
          </SectionLabel>
          <ol className="mt-4 max-h-[340px] overflow-y-auto">
            {ranking.map((r, i) => (
              <li key={r.name}>
                <Link
                  to={r.isYou ? '/executive/platforms/chatgpt' : `/executive/evidence?q=${encodeURIComponent(r.name.split(' ')[0].toLowerCase())}&period=90`}
                  className={cx('grid grid-cols-[44px_16px_1fr_56px_28px] items-center px-8 py-3 text-[15px] hover:bg-gray-50', r.isYou && 'bg-accent-subtle/50')}
                >
                  <span className={cx('font-mono text-[13px]', r.isYou ? 'text-accent' : 'text-gray-500')}>#{i + 1}</span>
                  <span className={cx('size-2 rounded-full', r.isYou ? 'bg-accent' : 'bg-gray-200')} />
                  <span className={cx(r.isYou ? 'font-medium text-gray-900' : 'text-gray-800')}>{r.name}</span>
                  <span className={cx('text-right font-mono text-sm', r.isYou ? 'text-accent' : 'text-gray-900')}>{r.score}</span>
                  <span className="text-right text-gray-300">–</span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-2 border-t border-default px-8 pt-3 text-xs text-gray-500">
            You: #{rank} of {EXPERT_KPIS.brandsTracked} brands
          </p>
        </section>
      </div>

      {/* Top prompts + site health / perception */}
      <div className="grid grid-cols-1 divide-default border-b border-default lg:grid-cols-[1fr_520px] lg:divide-x">
        <section className="px-10 py-8">
          <SectionLabel
            right={
              <>
                <MoreLink to="/executive/evidence">Open in Explore</MoreLink>
                <MoreLink to="/executive/platforms/chatgpt">View all</MoreLink>
              </>
            }
          >
            Top prompts
          </SectionLabel>
          <ol className="mt-4">
            {topPrompts.map((p, i) => (
              <li key={p.id}>
                <Link
                  to={`/executive/platforms/${p.appearsOn[0] ?? 'chatgpt'}?highlight=${p.id}`}
                  className="-mx-3 grid grid-cols-[28px_1fr_90px_44px_60px] items-center rounded-md px-3 py-3 hover:bg-gray-50"
                >
                  <span className="font-mono text-xs text-gray-400">{i + 1}</span>
                  <span className="text-[15px] text-gray-800">{p.text}</span>
                  <span className="font-mono text-[13px] text-gray-500">{p.volume}</span>
                  <span className="font-mono text-[15px] font-medium text-gray-900">{p.score}</span>
                  <BarCluster value={p.score} />
                </Link>
              </li>
            ))}
          </ol>
        </section>
        <div className="flex flex-col divide-y divide-default">
          <section className="px-8 py-8">
            <SectionLabel right={<MoreLink to="/executive/missions/m06">Optimize</MoreLink>}>Site health</SectionLabel>
            <Link to="/executive/missions/m06" className="group mt-4 flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-lg bg-gray-75">
                <Wrench size={18} strokeWidth={1.5} className="text-gray-400" />
              </span>
              <span>
                <span className="block text-sm text-gray-800">Case studies have no structured data</span>
                <span className="text-[13px] font-medium text-accent group-hover:text-accent-hover">Fix it ›</span>
              </span>
            </Link>
          </section>
          <section className="px-8 py-8">
            <SectionLabel right={<MoreLink to="/executive/evidence?issue=positioning&period=90">Details</MoreLink>}>Perception</SectionLabel>
            <Link to="/executive/evidence?issue=positioning&period=90" className="group mt-4 flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-lg bg-gray-75">
                <Brain size={18} strokeWidth={1.5} className="text-gray-400" />
              </span>
              <span>
                <span className="block text-sm text-gray-800">Gemini sees you as a consumer agency</span>
                <span className="text-[13px] font-medium text-accent group-hover:text-accent-hover">Analyze ›</span>
              </span>
            </Link>
          </section>
        </div>
      </div>

      {/* Model strip */}
      <div className="flex divide-x divide-default border-b border-default">
        {state.platforms.map((p) => {
          const c = coverage(state, p.id)
          const pct = Math.round((c.covered / c.total) * 100)
          return (
            <Link key={p.id} to={`/executive/platforms/${p.id}`} className="flex flex-1 flex-col gap-2 px-6 pb-3 pt-4 hover:bg-gray-50">
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <PlatformIcon id={p.id} size={18} /> {p.name}
                </span>
                <span className="font-mono text-[17px] font-medium">{pct}</span>
              </span>
              <span className="h-[3px] w-full rounded-full bg-gray-100">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </span>
            </Link>
          )
        })}
        <Link to="/executive/platforms/chatgpt" className="flex items-center gap-1 px-6 text-sm text-gray-700 hover:bg-gray-50">
          Compare <ChevronRight size={14} />
        </Link>
        <Link to="/executive/evidence" className="flex items-center gap-1 px-6 text-sm text-gray-700 hover:bg-gray-50">
          Open in Explore <ChevronRight size={14} />
        </Link>
      </div>

      {/* Citations / AI traffic / Conversations */}
      <div className="grid grid-cols-1 divide-default border-b border-default lg:grid-cols-3 lg:divide-x">
        <section className="px-10 py-8">
          <SectionLabel
            right={
              <>
                <MoreLink to="/executive/evidence">Open in Explore</MoreLink>
              </>
            }
          >
            Citations
          </SectionLabel>
          <div className="mt-6 flex h-10 items-end gap-0.5">
            {CITATION_WEEK.map((v, i) => (
              <span key={i} className="flex-1 rounded-t-sm bg-gray-100" style={{ height: `${(v / maxCite) * 100}%` }} />
            ))}
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-gray-400">
            <span>7d ago</span>
            <span>Today</span>
          </div>
          <div className="mt-5 font-mono text-[34px] font-medium leading-none">{EXPERT_KPIS.sourceDomains}</div>
          <div className="mt-1 text-xs text-gray-500">source domains</div>
          <SectionLabel className="mt-6" right={<span className="text-xs text-gray-400">all-time</span>}>
            Top sources
          </SectionLabel>
          <ul className="mt-2">
            {SOURCES.slice(0, 5).map((s) => (
              <li key={s.domain}>
                <Link
                  to={`/executive/evidence?q=${encodeURIComponent(s.domain.split('.')[0])}&period=90`}
                  className="-mx-2 flex items-center justify-between rounded-md px-2 py-2 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-3 text-[15px] text-gray-800">
                    <span className="flex size-5 items-center justify-center rounded-sm bg-gray-100 font-mono text-[10px] uppercase text-gray-500">
                      {s.domain[0]}
                    </span>
                    {s.domain}
                  </span>
                  <span className="font-mono text-[13px] text-gray-500">{s.citations}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="px-10 py-8">
          <SectionLabel>AI traffic</SectionLabel>
          <EmptyState
            icon={ChartNoAxesColumn}
            title="Connect analytics"
            body="See visitors from AI citations"
            action={
              <Btn size="sm" variant="soft" to="/integrations">
                Connect ›
              </Btn>
            }
          />
        </section>
        <section className="px-10 py-8">
          <SectionLabel right={<MoreLink to="/executive/missions/team">Team view</MoreLink>}>What changed</SectionLabel>
          <ul className="mt-4 divide-y divide-default">
            {state.activity.slice(0, 6).map((a) => (
              <li key={a.id} className="py-2.5">
                <Link to={a.missionId ? `/executive/missions/${a.missionId}` : '/executive/missions'} className="group flex gap-3">
                  <span className="w-[86px] shrink-0 font-mono text-xs text-gray-400">{fmtDay(a.date)}</span>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{a.text}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <AccentLink to="/executive/missions?status=all">All missions</AccentLink>
          </div>
        </section>
      </div>
    </div>
  )
}
