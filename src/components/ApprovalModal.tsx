import { useState } from 'react'
import type { Mission } from '../data/types'
import { currentStep } from '../state/reducer'
import { useStore } from '../state/store'
import { Modal } from './ui/overlays'
import { Btn } from './ui/primitives'

export function ApprovalModal({ mission, onClose }: { mission: Mission | null; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const [note, setNote] = useState('')
  const [asking, setAsking] = useState(false)
  if (!mission) return null
  const step = currentStep(mission)
  const ev = state.evidence.find((e) => e.id === mission.evidenceIds[0])
  const close = () => {
    setNote('')
    setAsking(false)
    onClose()
  }
  return (
    <Modal
      open
      onClose={close}
      title="Review approval"
      footer={
        asking ? (
          <>
            <Btn variant="ghost" onClick={() => setAsking(false)}>
              Back
            </Btn>
            <Btn
              onClick={() => {
                dispatch({ type: 'REQUEST_CHANGES', missionId: mission.id, note }, `Changes requested from ${mission.department}`)
                close()
              }}
            >
              Send back to {mission.department}
            </Btn>
          </>
        ) : (
          <>
            <Btn onClick={() => setAsking(true)}>Request changes</Btn>
            <Btn
              variant="primary"
              onClick={() => {
                dispatch(
                  { type: 'APPROVE', missionId: mission.id },
                  { text: `Approved. ${mission.department} is unblocked`, href: `/executive/missions/${mission.id}`, hrefLabel: 'Open mission' },
                )
                close()
              }}
            >
              Approve
            </Btn>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div>
          <div className="text-xs text-gray-500">
            Mission <span className="font-mono">{String(mission.number).padStart(2, '0')}</span> · {mission.department}
          </div>
          <div className="mt-0.5 text-[16px] font-medium text-gray-900">{mission.title}</div>
        </div>
        <div className="rounded-md border border-default bg-gray-50 px-4 py-3">
          <div className="text-xs text-gray-500">Asking {mission.approver} to</div>
          <div className="mt-0.5 text-[15px] text-gray-900">{step?.title}</div>
        </div>
        {ev && (
          <div>
            <div className="text-xs text-gray-500">Why (observed answer, illustrative)</div>
            <p className="mt-1 font-mono text-[13px] text-gray-700">“{ev.answer}”</p>
          </div>
        )}
        {asking && (
          <label className="block">
            <span className="text-xs text-gray-500">What needs to change?</span>
            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-default px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle"
              placeholder="e.g. Use the annual price, not the monthly one"
            />
          </label>
        )}
      </div>
    </Modal>
  )
}
