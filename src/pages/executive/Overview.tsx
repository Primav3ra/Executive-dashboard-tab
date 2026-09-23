import { ChevronRight, CircleCheck, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageTitle } from '../../components/shell/Chrome'
import { PlatformIcon } from '../../components/ui/PlatformIcon'
import { Btn, CoverageBar, NumberBadge, SectionLabel } from '../../components/ui/primitives'
import { TrendChart } from '../../components/ui/TrendChart'
import { BRAND } from '../../data/seed'
import { fmtShort } from '../../lib/format'
import { coverage, keyIssue, openMissions, platformsUp, verifiedThisMonth, visibilitySeries } from '../../state/reducer'
import { useStore } from '../../state/store'

function StepHead({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-4 border-b border-default pb-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[15px] font-medium text-white">{n}</span>
      <div>
        <h2 className="text-[21px] font-semibold tracking-tight text-gray-900">{title}</h2>
        <p className="mt-0.5 text-sm text-gray-500">{sub}</p>
      </div>
    </div>
  )
}

function Stat({ to, value, label, sub, pre }: { to: string; value: ReactNode; label: string; sub?: string; pre?: string }) {
  return (
    <Link to={to} className="group flex flex-1 flex-col items-center rounded-lg px-3 py-4 text-center transition-colors hover:bg-gray-50">
      {pre && <span className="mb-1 text-[13px] text-gray-600">{pre}</span>}
      <span className="font-mono text-[52px] font-medium leading-none tracking-tight text-accent">{value}</span>
      <span className="mt-2 text-[15px] text-gray-800 group-hover:underline group-hover:decoration-gray-300 group-hover:underline-offset-4">{label}</span>
      {sub && <span className="text-[13px] text-gray-500">{sub}</span>}
    </Link>
  )
}

export default function Overview() {
  const { state } = useStore()
  const nav = useNavigate()
  const trend = visibilitySeries(state)
  const up = platformsUp(state)
  const verified = verifiedThisMonth(state)
  const issue = keyIssue(state)
  const next = openMissions(state).slice(0, 3)
  const delta = Math.round((trend[trend.length - 1].value - trend[0].value) * 10) / 10

  return (
    <>
      <PageTitle title="Executive Overview" subtitle="What happened? What is going on? What is next?" />

      <div className="grid grid-cols-1 divide-y divide-default rounded-lg border border-default bg-white lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {/* 1 — What happened */}
        <section className="flex flex-col p-7">
          <StepHead n={1} title="What happened?" sub="Verified progress and key changes." />
          <div className="flex items-stretch py-5">
            <Stat to="/executive/missions?status=verified" value={verified.length} label="missions verified" sub="this month" />
            <div className="my-4 w-px bg-default" />
            <Stat to={`/executive/platforms/${up[0]?.id ?? 'chatgpt'}`} pre="Visibility up in" value={up.length} label="platforms" />
          </div>
          <SectionLabel right={<span className="font-mono text-xs text-accent">{delta >= 0 ? '+' : ''}{delta} pts</span>}>90-day visibility trend</SectionLabel>
          <div className="mt-3">
            <TrendChart
              data={trend}
              height={160}
              unit="%"
              ariaLabel="Visibility over the last 90 days"
              onPointClick={() => nav('/executive/expert#visibility')}
            />
          </div>
        </section>

        {/* 2 — What is going on */}
        <section className="flex flex-col p-7">
          <StepHead n={2} title="What is going on?" sub="Where you appear and what to watch." />
          <div className="border-b border-default py-5">
            <SectionLabel>Platform presence</SectionLabel>
            <p className="mt-1 text-[13px] text-gray-500">Tracked buying prompts where {BRAND} appears</p>
            <ul className="mt-3 -mx-2">
              {state.platforms.map((p) => {
                const c = coverage(state, p.id)
                return (
                  <li key={p.id}>
                    <Link
                      to={`/executive/platforms/${p.id}`}
                      className="group grid grid-cols-[120px_1fr_48px] items-center gap-3 rounded-md px-2 py-2.5 hover:bg-gray-50"
                    >
                      <span className="flex items-center gap-2 text-[15px] text-gray-800">
                        <PlatformIcon id={p.id} size={14} />
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
          </div>
          <div className="pt-5">
            <SectionLabel>Key issue</SectionLabel>
            {issue ? (
              <Link
                to={`/executive/evidence?highlight=${issue.id}`}
                className="group -mx-2 mt-3 flex items-center gap-4 rounded-md px-2 py-2.5 hover:bg-gray-50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200">
                  <TriangleAlert size={19} strokeWidth={1.75} className="text-amber-600" />
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] text-gray-900">{issue.title === 'Outdated pricing claim' ? 'Pricing claim is outdated' : issue.title}</span>
                  <span className="block text-xs text-gray-500">
                    {state.platforms.find((p) => p.id === issue.platformId)?.name} · observed <span className="font-mono">{fmtShort(issue.observed)}</span>
                  </span>
                </span>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
              </Link>
            ) : (
              <div className="mt-3 flex items-center gap-3 text-[15px] text-gray-700">
                <CircleCheck size={18} className="text-accent" /> No open issues
              </div>
            )}
          </div>
        </section>

        {/* 3 — What is next */}
        <section className="flex flex-col p-7">
          <StepHead n={3} title="What is next?" sub="Recommended actions to build on momentum." />
          <div className="pt-5">
            <SectionLabel right={<Link to="/executive/missions/team" className="text-xs text-gray-500 hover:text-gray-900">Who owns what ›</Link>}>
              Next actions
            </SectionLabel>
            <ul className="mt-2 divide-y divide-default">
              {next.map((m, i) => (
                <li key={m.id}>
                  <Link to={`/executive/missions/${m.id}`} className="group -mx-2 flex items-center gap-4 rounded-md px-2 py-5 hover:bg-gray-50">
                    <NumberBadge n={i + 1} tone="active" size={36} />
                    <span className="flex-1 text-[15px] text-gray-900">{m.title}</span>
                    <span className="text-sm text-gray-500">{m.department}</span>
                    <ChevronRight size={16} className="-ml-2 text-gray-300 group-hover:text-gray-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Btn size="lg" to="/executive/missions" arrow>
          View all missions
        </Btn>
        <Btn size="lg" to="/executive/evidence" arrow>
          Explore the evidence
        </Btn>
        <Btn size="lg" variant="primary" to="/executive/report?print=1" arrow>
          Download executive report
        </Btn>
      </div>
    </>
  )
}
