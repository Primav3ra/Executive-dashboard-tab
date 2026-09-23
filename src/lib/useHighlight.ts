import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

/** trakkr-style deep link: `?highlight=<id>` scrolls to `#row-<id>` and flashes it. */
export function useHighlight() {
  const [params] = useSearchParams()
  const id = params.get('highlight')
  useEffect(() => {
    if (!id) return
    const t = setTimeout(() => document.getElementById(`row-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
    return () => clearTimeout(t)
  }, [id])
  return id
}
