import type { PlatformId } from '../../data/types'

/** Simplified platform marks, in the spirit of trakkr's model logos. */
export function PlatformIcon({ id, size = 16 }: { id: PlatformId; size?: number }) {
  const s = { width: size, height: size }
  switch (id) {
    case 'chatgpt':
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth={1.6} aria-hidden>
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <rect key={r} x="9" y="2.5" width="6" height="11" rx="3" transform={`rotate(${r} 12 12)`} />
          ))}
        </svg>
      )
    case 'claude':
      return (
        <svg {...s} viewBox="0 0 24 24" stroke="#d97757" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
          {[0, 30, 60, 90, 120, 150].map((r) => (
            <line key={r} x1="12" y1="3" x2="12" y2="21" transform={`rotate(${r} 12 12)`} />
          ))}
        </svg>
      )
    case 'gemini':
      return (
        <svg {...s} viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2c.6 5.3 4.7 9.4 10 10-5.3.6-9.4 4.7-10 10-.6-5.3-4.7-9.4-10-10 5.3-.6 9.4-4.7 10-10Z" fill="#4f8df5" />
        </svg>
      )
    case 'aio':
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" strokeWidth={3.2} aria-hidden>
          <path d="M20.5 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h4.8a4.2 4.2 0 0 1-1.8 2.7" stroke="#4285f4" />
          <path d="M15 16.5A5.6 5.6 0 0 1 6.7 13.8" stroke="#34a853" />
          <path d="M6.7 13.8a5.6 5.6 0 0 1 0-3.6" stroke="#fbbc05" />
          <path d="M6.7 10.2A5.6 5.6 0 0 1 15.9 8" stroke="#ea4335" />
        </svg>
      )
  }
}
