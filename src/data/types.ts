export type PlatformId = 'chatgpt' | 'claude' | 'gemini' | 'aio'

export interface SeriesPoint {
  date: string // ISO yyyy-mm-dd
  value: number
}

export interface Platform {
  id: PlatformId
  name: string
  /** Weekly coverage % history. The latest point is always recomputed from tracked prompts. */
  history: SeriesPoint[]
}

export type Department = 'Marketing' | 'Content' | 'PR' | 'Analytics' | 'Web'

export type StepKind = 'task' | 'approval' | 'recheck'
export type StepStatus = 'done' | 'current' | 'locked'

export interface Step {
  id: string
  title: string
  kind: StepKind
  status: StepStatus
}

export type MissionStatus =
  | 'ready'
  | 'in_progress'
  | 'awaiting_approval'
  | 'waiting'
  | 'pending_recheck'
  | 'verified'

export type ApprovalState = 'none' | 'requested' | 'changes_requested'

export interface Mission {
  id: string
  number: number
  title: string
  summary: string
  why: string
  department: Department
  owner: string
  approver: string
  support: string
  effort: string
  due: string
  started: boolean
  approval: ApprovalState
  approvalNote?: string
  decisionAsk?: string
  dependsOn?: string[]
  steps: Step[]
  evidenceIds: string[]
  platformIds: PlatformId[]
  verifiedAt?: string
  status: MissionStatus
}

export type IssueType = 'pricing' | 'absence' | 'outdated' | 'positioning' | 'citation'

export interface EvidenceSource {
  label: string
  kind: 'official' | 'competitor' | 'third_party'
  url: string
  detail: string
  pages?: string[]
}

export interface Evidence {
  id: string
  title: string
  issue: IssueType
  badge: string
  platformId: PlatformId
  observed: string
  promptId: string
  answer: string
  source: EvidenceSource
  recommendation: string
  missionId: string
  resolved: boolean
}

export interface TrackedPrompt {
  id: string
  text: string
  volume: string
  /** 0–100 visibility score for this prompt across platforms */
  score: number
  appearsOn: PlatformId[]
}

export interface Competitor {
  name: string
  score: number
  mentions: number
  isYou?: boolean
}

export interface SourceDomain {
  domain: string
  citations: number
}

export interface ActivityItem {
  id: string
  date: string
  text: string
  missionId?: string
}

export interface AppState {
  platforms: Platform[]
  prompts: TrackedPrompt[]
  missions: Mission[]
  evidence: Evidence[]
  activity: ActivityItem[]
}
