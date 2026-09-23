import { describe, expect, it } from 'vitest'
import { createSeed } from '../data/seed'
import {
  coverage,
  deriveStatus,
  keyIssue,
  platformsUp,
  reducer,
  teamCounts,
  verifiedMissions,
  verifiedThisMonth,
} from './reducer'

const m = (s: ReturnType<typeof createSeed>, id: string) => s.missions.find((x) => x.id === id)!

describe('seed matches the mockups', () => {
  const s = createSeed()
  it('has consistent headline numbers', () => {
    expect(verifiedMissions(s)).toHaveLength(4)
    expect(verifiedThisMonth(s)).toHaveLength(2)
    expect(platformsUp(s)).toHaveLength(3)
    expect(coverage(s, 'chatgpt')).toEqual({ covered: 6, total: 20 })
    expect(coverage(s, 'claude')).toEqual({ covered: 4, total: 20 })
    expect(coverage(s, 'gemini')).toEqual({ covered: 7, total: 20 })
    expect(coverage(s, 'aio')).toEqual({ covered: 5, total: 20 })
    expect(teamCounts(s)).toEqual({ active: 3, awaiting: 1, recheck: 1 })
    expect(keyIssue(s)?.id).toBe('e01')
  })
  it('stored statuses agree with derived statuses', () => {
    for (const x of s.missions) expect([x.id, deriveStatus(x, s.missions)]).toEqual([x.id, x.status])
  })
})

describe('pricing mission flow', () => {
  it('send → approve → recheck → verified', () => {
    let s = createSeed()
    s = reducer(s, { type: 'SEND_FOR_APPROVAL', missionId: 'm01' })
    expect(m(s, 'm01').status).toBe('awaiting_approval')
    expect(teamCounts(s).awaiting).toBe(2)

    s = reducer(s, { type: 'APPROVE', missionId: 'm01' })
    expect(m(s, 'm01').status).toBe('pending_recheck')
    expect(m(s, 'm01').steps.map((x) => x.status)).toEqual(['done', 'done', 'done', 'current'])

    s = reducer(s, { type: 'RUN_RECHECK', missionId: 'm01' })
    expect(m(s, 'm01').status).toBe('verified')
    expect(verifiedMissions(s)).toHaveLength(5)
    expect(verifiedThisMonth(s)).toHaveLength(3)
    expect(keyIssue(s)?.id).toBe('e02')
  })

  it('request changes sends the mission back', () => {
    let s = reducer(createSeed(), { type: 'REQUEST_CHANGES', missionId: 'm03', note: 'Soften the claim' })
    expect(m(s, 'm03').status).toBe('ready')
    expect(m(s, 'm03').approvalNote).toBe('Soften the claim')
    s = reducer(s, { type: 'SEND_FOR_APPROVAL', missionId: 'm03' })
    expect(m(s, 'm03').status).toBe('awaiting_approval')
  })

  it('ignores actions that do not fit the current step', () => {
    const s = createSeed()
    expect(reducer(s, { type: 'APPROVE', missionId: 'm01' })).toBe(s)
    expect(reducer(s, { type: 'RUN_RECHECK', missionId: 'm02' })).toBe(s)
    expect(reducer(s, { type: 'COMPLETE_STEP', missionId: 'm04' })).toBe(s)
  })
})

describe('robotics mission raises coverage', () => {
  it('fixing absences adds prompts to coverage and unblocks the recheck mission', () => {
    let s = createSeed()
    s = reducer(s, { type: 'COMPLETE_STEP', missionId: 'm02' })
    s = reducer(s, { type: 'COMPLETE_STEP', missionId: 'm02' })
    expect(m(s, 'm02').status).toBe('pending_recheck')
    s = reducer(s, { type: 'RUN_RECHECK', missionId: 'm02' })
    expect(coverage(s, 'gemini').covered).toBe(8)
    expect(coverage(s, 'chatgpt').covered).toBe(7)
    expect(m(s, 'm04').status).toBe('waiting') // still waiting on m01

    s = reducer(s, { type: 'SEND_FOR_APPROVAL', missionId: 'm01' })
    s = reducer(s, { type: 'APPROVE', missionId: 'm01' })
    s = reducer(s, { type: 'RUN_RECHECK', missionId: 'm01' })
    expect(m(s, 'm04').status).toBe('ready')
  })
})
