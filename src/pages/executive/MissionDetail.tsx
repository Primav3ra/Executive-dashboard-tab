import { CircleCheck, Loader2, Lock, MessageSquareWarning } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ApprovalModal } from '../../components/ApprovalModal'
import { Breadcrumb } from '../../components/shell/Chrome'
import { Btn, Chip, CoverageBar, Dot, NumberBadge, Panel, cx } from '../../components/ui/primitives'
import type { Mission } from '../../data/types'
import { fmtShort, pad2, statusMeta } from '../../lib/format'
import { currentStep } from '../../state/reducer'
import { useStore } from '../../state/store'

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center border-b border-default py-2.5 last:border-0">
      <dt className="text-[15px] text-gray-500">{k}</dt>
      <dd className="text-[15px] text-gray-900">{v}</dd>
    </div>
  )
}

export default function MissionDetail() {
  const { id } = useParams()
  const { state, dispatch } = useStore()
  const [reviewing, setReviewing] = useState<Mission | null>(null)
  const [checking, setChecking] = useState(false)
  const m = state.missions.find((x) => x.id === id)
  if (!m) return <Navigate to="/executive/missions" replace />

  const done = m.steps.filter((s) => s.status === 'done').length
  const cur = currentStep(m)
  const s = statusMeta(m, 'detail')
  const ev = state.evidence.find((e) => e.id === m.evidenceIds[0])
  const deps = (m.dependsOn ?? []).map((d) => state.missions.find((x) => x.id === d)!).filter((d) => d.status !== 'verified')
  const history = state.activity.filter((a) => a.missionId === m.id).slice(0, 4)

  const runCheck = () => {
    setChecking(true)
    setTimeout(() => {
      dispatch(
        { type: 'RUN_RECHECK', missionId: m.id },
        { text: 'Fresh AI check passed. Mission verified', href: '/executive', hrefLabel: 'See overview' },
      )
      setChecking(false)
    }, 1400)
  }

  let nextAction: string = cur?.title ?? 'Nothing left to do'
  let cta: React.ReactNode
  if (m.status === 'waiting') {
    nextAction = `Wait for ${deps.map((d) => `Mission ${pad2(d.number)}`).join(' and ')}`
    cta = (
      <Btn size="lg" disabled className="w-full">
        Waiting on other missions
      </Btn>
    )
  } else if (m.status === 'verified') {
    nextAction = 'Nothing. Outcome verified'
    cta = (
      <Btn size="lg" variant="soft" to={ev ? `/executive/evidence?highlight=${ev.id}` : '/executive/evidence'} arrow className="w-full">
        See the verified evidence
      </Btn>
    )
  } else if (cur?.kind === 'recheck') {
    cta = (
      <Btn size="lg" variant="primary" onClick={runCheck} disabled={checking} className="w-full">
        {checking ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Checking 4 platforms…
          </span>
        ) : (
          'Run a fresh AI check'
        )}
      </Btn>
    )
  } else if (cur?.kind === 'approval' && m.approval === 'requested') {
    nextAction = `${m.approver} to approve`
    cta = (
      <Btn size="lg" variant="primary" onClick={() => setReviewing(m)} className="w-full">
        Review approval
      </Btn>
    )
  } else if (cur?.kind === 'approval') {
    cta = (
      <Btn
        size="lg"
        variant="primary"
        className="w-full"
        onClick={() =>
          dispatch(
            { type: 'SEND_FOR_APPROVAL', missionId: m.id },
            { text: `Sent to ${m.approver} for approval`, href: '/executive/missions/team', hrefLabel: 'Team view' },
          )
        }
      >
        Send for approval
      </Btn>
    )
  } else if (!m.started) {
    cta = (
      <Btn size="lg" variant="primary" className="w-full" onClick={() => dispatch({ type: 'START_MISSION', missionId: m.id }, 'Mission started')}>
        Start mission
      </Btn>
    )
  } else {
    cta = (
      <Btn size="lg" variant="primary" className="w-full" onClick={() => dispatch({ type: 'COMPLETE_STEP', missionId: m.id }, `“${cur?.title}” marked complete`)}>
        Mark step complete
      </Btn>
    )
  }

  const outcome =
    m.status === 'verified' ? (
      <span className="inline-flex items-center gap-1.5 text-accent">
        <CircleCheck size={15} /> Verified <span className="font-mono">{m.verifiedAt && fmtShort(m.verifiedAt)}</span>
      </span>
    ) : m.status === 'pending_recheck' ? (
      'Pending recheck'
    ) : (
      <span className="text-gray-500">Not yet</span>
    )

  return (
    <>
      <Breadcrumb items={[{ label: 'Guided Missions', to: '/executive/missions' }, { label: `Mission ${pad2(m.number)}` }]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_424px]">
        <div>
          <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.025em]">{m.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Chip tone={s.chip}>
              <Dot className={s.dot} /> {s.label}
            </Chip>
            <span className="text-[13px] text-gray-500">
              {m.department} · due <span className="font-mono">{m.due}</span>
            </span>
          </div>
          <p className="mt-3 text-[17px] text-gray-500">Complete the steps below to fix this issue and improve your visibility.</p>
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-[21px] font-semibold tracking-tight">
            <span className="font-mono">{done}</span> of <span className="font-mono">{m.steps.length}</span> steps complete
          </div>
          <CoverageBar covered={done} total={m.steps.length} height={18} className="mt-3 rounded-md [&>div]:rounded-md" />
          <span className="mt-2 font-mono text-[13px] text-gray-500">{Math.round((done / m.steps.length) * 100)}% complete</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_424px]">
        <Panel className="p-7">
          <h2 className="text-[21px] font-semibold tracking-tight">Why this matters</h2>
          <p className="mt-1 text-[15px] text-gray-600">{m.why}</p>
          {ev && (
            <>
              <div className="mt-4 rounded-md border border-default bg-gray-75 px-4 py-3.5">
                <div className="text-sm font-medium text-gray-900">
                  Evidence from AI answer <span className="font-normal text-gray-500">(illustrative)</span>
                </div>
                <p className="mt-2 font-mono text-[13px] leading-relaxed text-gray-700">“{ev.answer}”</p>
              </div>
              <Link to={`/executive/evidence?highlight=${ev.id}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover">
                Explore the evidence <span aria-hidden>→</span>
              </Link>
            </>
          )}
          {m.approvalNote && m.approval === 'changes_requested' && (
            <div className="mt-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
              <MessageSquareWarning size={17} className="mt-0.5 shrink-0 text-amber-700" />
              <div>
                <div className="text-sm font-medium text-amber-700">{m.approver} requested changes</div>
                <p className="text-sm text-gray-700">{m.approvalNote}</p>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-default pt-6">
            <h2 className="text-[21px] font-semibold tracking-tight">How to fix it</h2>
            <p className="mt-1 text-[15px] text-gray-600">Follow these steps to resolve the issue.</p>
            <ol className="mt-3 divide-y divide-default">
              {m.steps.map((st, i) => {
                const isCur = st.status === 'current' && m.status !== 'waiting'
                return (
                  <li key={st.id} className={cx('-mx-3 flex items-center gap-4 rounded-md px-3 py-3', isCur && 'bg-amber-50/70')}>
                    <NumberBadge n={i + 1} tone={st.status === 'done' ? 'active' : isCur ? 'warn' : 'neutral'} size={32} />
                    <span className={cx('flex-1 text-[15px]', st.status === 'locked' ? 'text-gray-500' : 'text-gray-900', isCur && 'font-medium')}>
                      {st.title}
                    </span>
                    <span className="flex w-[190px] items-center gap-2 text-sm">
                      {st.status === 'done' ? (
                        <>
                          <CircleCheck size={17} className="fill-accent text-white" /> <span className="text-gray-600">Completed</span>
                        </>
                      ) : isCur ? (
                        <>
                          <Dot className="size-3 bg-amber-500" />
                          <span className="text-amber-700">
                            {st.kind === 'approval' && m.approval === 'requested' ? 'Awaiting approval' : 'Current step'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Lock size={15} className="text-gray-400" />{' '}
                          <span className="text-gray-500">{m.status === 'waiting' && i === 0 ? 'Waiting on changes' : 'Locked until update'}</span>
                        </>
                      )}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel className="p-6">
            <h2 className="text-[21px] font-semibold tracking-tight">Execution</h2>
            <dl className="mt-2">
              <Row k="Owner" v={m.department} />
              <Row k="Approver" v={m.approver} />
              <Row k="Support" v={m.support} />
              <Row k="Next action" v={nextAction} />
            </dl>
            <div className="mt-4">{cta}</div>
          </Panel>
          <Panel className="p-6">
            <h2 className="text-[21px] font-semibold tracking-tight">Mission status</h2>
            <dl className="mt-2">
              <Row
                k="Work completed"
                v={
                  <span className="font-mono">
                    {done}/{m.steps.length}
                  </span>
                }
              />
              <Row k="Outcome verified" v={outcome} />
              <Row k="Effort" v={<span className="font-mono text-sm">{m.effort}</span>} />
            </dl>
            {history.length > 0 && (
              <div className="mt-4 border-t border-default pt-4">
                <div className="label-caps">History</div>
                <ul className="mt-2 space-y-1.5">
                  {history.map((a) => (
                    <li key={a.id} className="flex gap-3 text-[13px]">
                      <span className="w-12 shrink-0 font-mono text-gray-400">{fmtShort(a.date)}</span>
                      <span className="text-gray-700">{a.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
          <Btn size="lg" to="/executive/missions?status=all" arrow>
            Back to all missions
          </Btn>
        </div>
      </div>

      <ApprovalModal mission={reviewing} onClose={() => setReviewing(null)} />
    </>
  )
}
