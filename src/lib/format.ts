import type { IssueType, Mission, MissionStatus } from '../data/types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/** "23 Sep" */
export const fmtShort = (iso: string) => {
  const d = parse(iso)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}
/** "Sep 23" — chart axis */
export const fmtAxis = (iso: string) => {
  const d = parse(iso)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}
/** "23 Sep 2026" */
export const fmtLong = (iso: string) => `${fmtShort(iso)} ${parse(iso).getUTCFullYear()}`
/** "Wed 23 Sep" */
export const fmtDay = (iso: string) => `${DAYS[parse(iso).getUTCDay()]} ${fmtShort(iso)}`

export const daysBetween = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86_400_000)

export const pad2 = (n: number) => String(n).padStart(2, '0')

export const ISSUE_LABEL: Record<IssueType, string> = {
  pricing: 'Outdated pricing',
  absence: 'Missing from answer',
  outdated: 'Outdated facts',
  positioning: 'Wrong positioning',
  citation: 'Weak citations',
}

export type StatusContext = 'missions' | 'team' | 'detail'

interface StatusMeta {
  label: string
  dot: string
  chip: 'accent' | 'warn' | 'error' | 'neutral' | 'info'
}

export function statusMeta(m: Mission, ctx: StatusContext = 'missions'): StatusMeta {
  const s: MissionStatus = m.status
  switch (s) {
    case 'ready':
      if (m.approval === 'changes_requested') return { label: 'Changes requested', dot: 'bg-amber-500', chip: 'warn' }
      return m.started
        ? { label: 'Ready now', dot: 'bg-accent', chip: 'accent' }
        : { label: 'Ready to start', dot: 'bg-accent', chip: 'accent' }
    case 'in_progress':
      return { label: 'In progress', dot: 'bg-amber-500', chip: 'warn' }
    case 'awaiting_approval':
      return ctx === 'team'
        ? { label: `Awaiting ${m.approver.toLowerCase()} approval`, dot: 'bg-red-500', chip: 'error' }
        : { label: 'Blocked: needs approval', dot: 'bg-red-500', chip: 'error' }
    case 'waiting':
      return { label: 'Waiting on changes', dot: 'bg-gray-400', chip: 'neutral' }
    case 'pending_recheck':
      return { label: 'Pending recheck', dot: 'bg-violet-500', chip: 'info' }
    case 'verified':
      return { label: 'Verified', dot: 'bg-accent', chip: 'accent' }
  }
}
