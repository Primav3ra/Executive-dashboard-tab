import { TODAY, createSeed } from '../data/seed'
import type { AppState, Mission, MissionStatus, PlatformId } from '../data/types'

export type Action =
  | { type: 'START_MISSION'; missionId: string }
  | { type: 'COMPLETE_STEP'; missionId: string }
  | { type: 'SEND_FOR_APPROVAL'; missionId: string }
  | { type: 'APPROVE'; missionId: string }
  | { type: 'REQUEST_CHANGES'; missionId: string; note: string }
  | { type: 'RUN_RECHECK'; missionId: string }
  | { type: 'RESET' }

export const currentStep = (m: Mission) => m.steps.find((s) => s.status === 'current')

export function deriveStatus(m: Mission, all: Mission[]): MissionStatus {
  const cur = currentStep(m)
  if (!cur) return 'verified'
  const blockedByDeps = (m.dependsOn ?? []).some((id) => all.find((x) => x.id === id)?.status !== 'verified')
  if (blockedByDeps && !m.started) return 'waiting'
  if (cur.kind === 'recheck') return 'pending_recheck'
  if (cur.kind === 'approval') return m.approval === 'requested' ? 'awaiting_approval' : 'ready'
  return m.started ? 'in_progress' : 'ready'
}

/** Mark the current step done and unlock the next one. */
function advance(m: Mission): Mission {
  const idx = m.steps.findIndex((s) => s.status === 'current')
  if (idx === -1) return m
  const steps = m.steps.map((s, i) =>
    i === idx ? { ...s, status: 'done' as const } : i === idx + 1 ? { ...s, status: 'current' as const } : s,
  )
  return { ...m, steps, started: true }
}

function withStatuses(state: AppState): AppState {
  // Two passes so dependency changes propagate (m04 waits on m01/m02)
  let missions = state.missions
  for (let pass = 0; pass < 2; pass++) {
    missions = missions.map((m) => ({ ...m, status: deriveStatus(m, missions) }))
  }
  return { ...state, missions }
}

function log(state: AppState, text: string, missionId?: string): AppState {
  const item = { id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`, date: TODAY, text, missionId }
  return { ...state, activity: [item, ...state.activity] }
}

function updateMission(state: AppState, id: string, fn: (m: Mission) => Mission): AppState {
  return { ...state, missions: state.missions.map((m) => (m.id === id ? fn(m) : m)) }
}

export function reducer(state: AppState, action: Action): AppState {
  if (action.type === 'RESET') return createSeed()
  const mission = state.missions.find((m) => m.id === action.missionId)
  if (!mission) return state
  const cur = currentStep(mission)

  switch (action.type) {
    case 'START_MISSION': {
      if (mission.started || mission.status === 'waiting') return state
      const next = updateMission(state, mission.id, (m) => ({ ...m, started: true }))
      return withStatuses(log(next, `${mission.department} started “${mission.title}”`, mission.id))
    }
    case 'COMPLETE_STEP': {
      if (!cur || cur.kind !== 'task' || mission.status === 'waiting') return state
      const next = updateMission(state, mission.id, advance)
      return withStatuses(log(next, `${cur.title} — done`, mission.id))
    }
    case 'SEND_FOR_APPROVAL': {
      if (!cur || cur.kind !== 'approval' || mission.approval === 'requested') return state
      const next = updateMission(state, mission.id, (m) => ({ ...m, approval: 'requested', approvalNote: undefined }))
      return withStatuses(log(next, `“${cur.title}” sent to ${mission.approver} for approval`, mission.id))
    }
    case 'APPROVE': {
      if (!cur || cur.kind !== 'approval' || mission.approval !== 'requested') return state
      const next = updateMission(state, mission.id, (m) => ({ ...advance(m), approval: 'none' }))
      return withStatuses(log(next, `${mission.approver} approved “${cur.title}”`, mission.id))
    }
    case 'REQUEST_CHANGES': {
      if (!cur || mission.approval !== 'requested') return state
      const next = updateMission(state, mission.id, (m) => ({
        ...m,
        approval: 'changes_requested',
        approvalNote: action.note || 'Changes requested',
      }))
      return withStatuses(log(next, `${mission.approver} requested changes on “${cur.title}”`, mission.id))
    }
    case 'RUN_RECHECK': {
      if (!cur || cur.kind !== 'recheck') return state
      let next = updateMission(state, mission.id, (m) => ({ ...advance(m), verifiedAt: TODAY }))
      // A verified fix resolves its evidence; fixed absences mean the brand now appears on that prompt.
      const fixed = state.evidence.filter((e) => mission.evidenceIds.includes(e.id))
      next = {
        ...next,
        evidence: next.evidence.map((e) => (mission.evidenceIds.includes(e.id) ? { ...e, resolved: true } : e)),
        prompts: next.prompts.map((p) => {
          const gained = fixed
            .filter((e) => e.promptId === p.id && !p.appearsOn.includes(e.platformId))
            .map((e) => e.platformId)
          return gained.length ? { ...p, appearsOn: [...p.appearsOn, ...gained], score: Math.max(p.score, 35) } : p
        }),
      }
      return withStatuses(log(next, `“${mission.title}” verified by a fresh AI check`, mission.id))
    }
  }
}

// ── Selectors ────────────────────────────────────────────────────────────

export const coverage = (state: AppState, id: PlatformId) => ({
  covered: state.prompts.filter((p) => p.appearsOn.includes(id)).length,
  total: state.prompts.length,
})

/** Platform history with the latest point recomputed from live coverage. */
export function platformSeries(state: AppState, id: PlatformId) {
  const p = state.platforms.find((x) => x.id === id)!
  const { covered, total } = coverage(state, id)
  const hist = p.history.slice()
  hist[hist.length - 1] = { ...hist[hist.length - 1], value: Math.round((covered / total) * 100) }
  return hist
}

/** Overall visibility = mean platform coverage %, per week. */
export function visibilitySeries(state: AppState) {
  const all = state.platforms.map((p) => platformSeries(state, p.id))
  return all[0].map((pt, i) => ({
    date: pt.date,
    value: Math.round((all.reduce((sum, s) => sum + s[i].value, 0) / all.length) * 10) / 10,
  }))
}

export const platformsUp = (state: AppState) =>
  state.platforms.filter((p) => {
    const s = platformSeries(state, p.id)
    return s[s.length - 1].value > s[0].value
  })

export const verifiedMissions = (state: AppState) => state.missions.filter((m) => m.status === 'verified')
export const verifiedThisMonth = (state: AppState) =>
  verifiedMissions(state).filter((m) => m.verifiedAt?.startsWith(TODAY.slice(0, 7)))

export const openMissions = (state: AppState) =>
  state.missions.filter((m) => m.status !== 'verified').sort((a, b) => a.number - b.number)

export const teamCounts = (state: AppState) => ({
  active: state.missions.filter((m) => ['ready', 'in_progress', 'awaiting_approval'].includes(m.status) && m.started)
    .length,
  awaiting: state.missions.filter((m) => m.status === 'awaiting_approval').length,
  recheck: state.missions.filter((m) => m.status === 'pending_recheck').length,
})

export const keyIssue = (state: AppState) => state.evidence.find((e) => !e.resolved)

export function level(verified: number) {
  if (verified >= 9) return { n: 4, name: 'Category leader' }
  if (verified >= 6) return { n: 3, name: 'Shaping answers' }
  if (verified >= 3) return { n: 2, name: 'Building authority' }
  return { n: 1, name: 'Getting found' }
}
