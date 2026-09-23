import { Check, ChevronDown, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cx } from './primitives'

function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close()
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open, close, ref])
}

/** trakkr-style select button: "Platform: All ▾" with a popover menu */
export function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string
  value: T
  options: { id: T; label: string }[]
  onChange: (v: T) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(open, () => setOpen(false), ref)
  const current = options.find((o) => o.id === value)
  return (
    <div ref={ref} className={cx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cx(
          'flex h-10 w-full items-center justify-between gap-3 rounded-md border bg-white px-3.5 text-sm shadow-sm transition-colors',
          open ? 'border-accent ring-2 ring-accent-subtle' : 'border-default hover:border-hover',
        )}
      >
        <span className="text-gray-500">
          {label}: <span className="font-medium text-gray-900">{current?.label}</span>
        </span>
        <ChevronDown size={15} className={cx('text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-default bg-white py-1 shadow-overlay">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                onChange(o.id)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              {o.label}
              {o.id === value && <Check size={14} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Header button with a small menu (Share ▾, Reports ▾) */
export function MenuButton({
  children,
  items,
}: {
  children: ReactNode
  items: { label: string; onClick: () => void; hint?: string }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(open, () => setOpen(false), ref)
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-default bg-white px-3.5 text-[15px] font-medium text-gray-700 shadow-sm hover:border-hover hover:bg-gray-50"
      >
        {children}
        <ChevronDown size={14} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 min-w-[220px] rounded-lg border border-default bg-white py-1 shadow-overlay">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              onClick={() => {
                it.onClick()
                setOpen(false)
              }}
              className="flex w-full flex-col px-3.5 py-2 text-left hover:bg-gray-50"
            >
              <span className="text-sm text-gray-800">{it.label}</span>
              {it.hint && <span className="text-xs text-gray-500">{it.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(open, onClose, ref)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 p-4 backdrop-blur-[1px]">
      <div ref={ref} role="dialog" aria-modal aria-label={title} className="w-full max-w-lg rounded-xl border border-default bg-white shadow-overlay">
        <div className="flex items-center justify-between border-b border-default px-6 py-4">
          <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-default bg-gray-50 px-6 py-3.5">{footer}</div>}
      </div>
    </div>
  )
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(open, onClose, ref)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-gray-900/15">
      <aside ref={ref} role="dialog" aria-label={title} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-default bg-white shadow-overlay">
        <div className="flex items-center justify-between border-b border-default px-6 py-4">
          <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </aside>
    </div>
  )
}
