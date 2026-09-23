import {
  Cable,
  ChartNoAxesColumn,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  LayoutGrid,
  LifeBuoy,
  Link2,
  MessageSquareText,
  Play,
  Presentation,
  Settings,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { BRAND } from '../../data/seed'
import { cx } from '../ui/primitives'

interface Item {
  to: string
  label: string
  icon: LucideIcon
  chevron?: boolean
  badge?: string
}

const top: Item[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/executive', label: 'Executive', icon: Presentation, badge: 'New' },
  { to: '/actions', label: 'Actions', icon: Play },
]
const middle: Item[] = [
  { to: '/prompts', label: 'Prompts', icon: MessageSquareText, chevron: true },
  { to: '/visibility', label: 'Visibility', icon: Eye, chevron: true },
  { to: '/traffic', label: 'Traffic', icon: ChartNoAxesColumn, chevron: true },
  { to: '/growth', label: 'Growth', icon: TrendingUp, chevron: true },
]
const bottom: Item[] = [
  { to: '/connect', label: 'Connect your AI', icon: Cable, chevron: true },
  { to: '/integrations', label: 'Integrations', icon: Link2 },
  { to: '/support', label: 'Support', icon: LifeBuoy, chevron: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M3 4h5l4 10 4-10h5l-7.2 16h-3.6Z" fill="#1c1917" />
      <path d="M16 4h5l-2.6 5.8h-5Z" fill="var(--color-accent)" />
    </svg>
  )
}

function NavItem({ item, collapsed }: { item: Item; collapsed: boolean }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cx(
          'group flex h-10 items-center gap-3 rounded-lg px-2.5 text-[15px] transition-colors',
          isActive ? 'bg-accent-subtle text-accent' : 'text-gray-700 hover:bg-gray-75 hover:text-gray-900',
          collapsed && 'justify-center px-0',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} strokeWidth={1.5} className={isActive ? 'text-accent' : 'text-gray-500 group-hover:text-gray-700'} />
          {!collapsed && (
            <>
              <span className={cx('flex-1', isActive && 'font-medium')}>{item.label}</span>
              {item.badge && !isActive && (
                <span className="rounded-sm bg-accent-subtle px-1.5 py-px font-mono text-[10px] text-accent">{item.badge}</span>
              )}
              {item.chevron && <ChevronRight size={14} className="text-gray-400" />}
            </>
          )}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={cx(
        'no-print sticky top-0 flex h-screen shrink-0 flex-col border-r border-default bg-white transition-[width] duration-200',
        collapsed ? 'w-[68px]' : 'w-[250px]',
      )}
    >
      <div className={cx('flex h-[70px] items-center gap-2.5 border-b border-default px-5', collapsed && 'justify-center px-0')}>
        <BrandMark />
        {!collapsed && <span className="text-[17px] font-semibold tracking-tight">{BRAND}</span>}
      </div>

      <nav className="flex flex-col gap-0.5 border-b border-default px-2.5 py-4">
        <button
          type="button"
          className={cx('flex h-10 items-center gap-3 rounded-lg px-2.5 text-[15px] text-gray-700 hover:bg-gray-75', collapsed && 'justify-center px-0')}
          title="Ask (⌘K)"
        >
          <span className="relative flex size-[17px] items-center justify-center">
            <span className="absolute size-3.5 rounded-full bg-accent-subtle" />
            <span className="relative size-1.5 rounded-full bg-accent" />
          </span>
          {!collapsed && (
            <>
              <span>Ask</span>
              <span className="rounded-sm border border-default bg-gray-50 px-1.5 font-mono text-[11px] text-gray-400">⌘K</span>
            </>
          )}
        </button>
        {top.map((i) => (
          <NavItem key={i.to} item={i} collapsed={collapsed} />
        ))}
      </nav>

      <nav className="flex flex-1 flex-col gap-1 px-2.5 py-4">
        {middle.map((i) => (
          <NavItem key={i.to} item={i} collapsed={collapsed} />
        ))}
      </nav>

      <div className={cx('flex px-5 pb-3', collapsed ? 'justify-center px-0' : 'justify-end')}>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 border-t border-default px-2.5 py-3">
        {bottom.map((i) => (
          <NavItem key={i.to} item={i} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  )
}
