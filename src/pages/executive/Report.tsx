import { ArrowLeft, Printer } from 'lucide-react'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BrandMark } from '../../components/shell/Sidebar'
import { Btn, CoverageBar } from '../../components/ui/primitives'
import { TrendChart } from '../../components/ui/TrendChart'
import { BRAND, TODAY } from '../../data/seed'
import { fmtLong, fmtShort, pad2, statusMeta } from '../../lib/format'
import { coverage, keyIssue, level, openMissions, platformsUp, verifiedMissions, verifiedThisMonth, visibilitySeries } from '../../state/reducer'
import { useStore } from '../../state/store'

function H({ n, children }: { n: number; children: string }) {
  return (
    <h2 className="flex items-center gap-3 text-[17px] font-semibold tracking-tight">
      <span className="flex size-6 items-center justify-center rounded-full bg-accent font-mono text-xs text-white">{n}</span>
      {children}
    </h2>
  )
}

export default function Report() {
  const { state } = useStore()
  const [params] = useSearchParams()
  useEffect(() => {
    if (params.get('print') !== '1') return
    const t = setTimeout(() => window.print(), 600)
    return () => clearTimeout(t)
  }, [params])

  const trend = visibilitySeries(state)
  const verified = verifiedMissions(state).length
  const issue = keyIssue(state)
  const lvl = level(verified)

  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[800px] justify-between">
        <Btn to="/executive" icon={ArrowLeft}>
          Back to overview
        </Btn>
        <Btn variant="primary" icon={Printer} onClick={() => window.print()}>
          Save as PDF
        </Btn>
      </div>
      <article className="mx-auto max-w-[800px] rounded-lg border border-default bg-white p-12 shadow-card print:max-w-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex items-start justify-between border-b border-default pb-6">
          <div>
            <div className="flex items-center gap-2">
              <BrandMark size={20} />
              <span className="text-[15px] font-semibold">{BRAND}</span>
            </div>
            <h1 className="mt-4 text-[28px] font-semibold tracking-tight">Executive report</h1>
            <p className="text-sm text-gray-500">AI search visibility · illustrative demo data</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div>Data through</div>
            <div className="font-mono text-sm text-gray-900">{fmtLong(TODAY)}</div>
          </div>
        </header>

        <section className="grid grid-cols-4 divide-x divide-default border-b border-default py-5">
          {[
            ['Visibility', `${trend[trend.length - 1].value}%`],
            ['Missions verified', `${verified}/${state.missions.length}`],
            ['This month', String(verifiedThisMonth(state).length)],
            ['Platforms up', String(platformsUp(state).length)],
          ].map(([k, v]) => (
            <div key={k} className="px-4 first:pl-0">
              <div className="label-caps">{k}</div>
              <div className="mt-1 font-mono text-[24px] font-medium">{v}</div>
            </div>
          ))}
        </section>

        <section className="border-b border-default py-6">
          <H n={1}>What happened</H>
          <div className="mt-3">
            <TrendChart data={trend} height={140} unit="%" ariaLabel="90-day visibility" />
          </div>
          <ul className="mt-3 space-y-1 text-sm text-gray-700">
            {state.activity.slice(0, 4).map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="w-12 font-mono text-gray-400">{fmtShort(a.date)}</span>
                {a.text}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-default py-6">
          <H n={2}>What is going on</H>
          <div className="mt-3 space-y-2">
            {state.platforms.map((p) => {
              const c = coverage(state, p.id)
              return (
                <div key={p.id} className="grid grid-cols-[120px_1fr_48px] items-center gap-3 text-sm">
                  <span>{p.name}</span>
                  <CoverageBar covered={c.covered} total={c.total} />
                  <span className="text-right font-mono text-gray-600">
                    {c.covered}/{c.total}
                  </span>
                </div>
              )
            })}
          </div>
          {issue && (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
              <span className="font-medium text-amber-700">Key issue:</span> {issue.title}. “{issue.answer}”
            </p>
          )}
        </section>

        <section className="py-6">
          <H n={3}>What is next</H>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-default">
                <th className="py-2 font-medium">#</th>
                <th className="py-2 font-medium">Mission</th>
                <th className="py-2 font-medium">Owner</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default">
              {openMissions(state).map((m) => (
                <tr key={m.id}>
                  <td className="py-2 font-mono text-gray-400">{pad2(m.number)}</td>
                  <td className="py-2">{m.title}</td>
                  <td className="py-2 text-gray-600">{m.department}</td>
                  <td className="py-2 text-gray-600">{statusMeta(m, 'team').label}</td>
                  <td className="py-2 font-mono text-gray-600">{m.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-gray-500">
            Level {lvl.n} · {lvl.name}. Every recommendation is tied to an observed AI answer or source.
          </p>
        </section>
      </article>
    </div>
  )
}
