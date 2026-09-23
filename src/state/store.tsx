import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react'
import { createSeed } from '../data/seed'
import type { AppState } from '../data/types'
import { reducer, type Action } from './reducer'

const KEY = 'exec-dashboard:v1'

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as AppState) : null
    if (parsed?.prompts && parsed.missions && parsed.platforms) return parsed
  } catch {
    /* fall through to seed */
  }
  return createSeed()
}

interface Toast {
  id: number
  text: string
  href?: string
  hrefLabel?: string
}

interface Store {
  state: AppState
  dispatch: (a: Action, toast?: Omit<Toast, 'id'> | string) => void
  toast: (t: Omit<Toast, 'id'> | string) => void
  toasts: Toast[]
  dismiss: (id: number) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, load)
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable (sandboxed webview, private mode): keep state in memory */
    }
  }, [state])

  const dismiss = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), [])

  const toast = useCallback(
    (t: Omit<Toast, 'id'> | string) => {
      const id = nextId.current++
      setToasts((ts) => [...ts.slice(-2), { id, ...(typeof t === 'string' ? { text: t } : t) }])
      setTimeout(() => dismiss(id), 3800)
    },
    [dismiss],
  )

  const dispatch = useCallback(
    (a: Action, t?: Omit<Toast, 'id'> | string) => {
      rawDispatch(a)
      if (t) toast(t)
    },
    [toast],
  )

  return <Ctx.Provider value={{ state, dispatch, toast, toasts, dismiss }}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside StoreProvider')
  return s
}
