import { Compass, RotateCcw } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Btn, EmptyState } from '../components/ui/primitives'
import { useStore } from '../state/store'

export default function Placeholder() {
  const { pathname } = useLocation()
  const { dispatch } = useStore()
  const name = pathname.slice(1).split('/')[0] || 'page'
  const title = name.charAt(0).toUpperCase() + name.slice(1)
  return (
    <>
      <header className="flex h-[70px] items-center border-b border-default px-10">
        <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
      </header>
      <div className="px-10 py-10">
        <div className="rounded-lg border border-dashed border-default bg-gray-50">
          <EmptyState
            icon={Compass}
            title="Not part of this demo"
            body="This build covers the Executive tab. Other trakkr sections are placeholders."
            action={
              <div className="flex gap-2">
                <Btn variant="soft" to="/executive" arrow>
                  Go to Executive
                </Btn>
                {name === 'settings' && (
                  <Btn icon={RotateCcw} onClick={() => dispatch({ type: 'RESET' }, 'Demo data reset')}>
                    Reset demo data
                  </Btn>
                )}
              </div>
            }
          />
        </div>
      </div>
    </>
  )
}
