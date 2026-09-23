import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { ExecHeader, MissionPill, Toaster } from './components/shell/Chrome'
import { Sidebar } from './components/shell/Sidebar'
import Evidence from './pages/executive/Evidence'
import ExpertView from './pages/executive/ExpertView'
import MissionDetail from './pages/executive/MissionDetail'
import Missions from './pages/executive/Missions'
import Overview from './pages/executive/Overview'
import PlatformDetail from './pages/executive/PlatformDetail'
import Report from './pages/executive/Report'
import TeamWork from './pages/executive/TeamWork'
import Placeholder from './pages/Placeholder'

function Shell() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <MissionPill />
      <Toaster />
    </div>
  )
}

function ExecLayout() {
  return (
    <>
      <ExecHeader />
      <div className="max-w-[1680px] px-10 pb-24 pt-9">
        <Outlet />
      </div>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/executive/report" element={<Report />} />
      <Route element={<Shell />}>
        <Route index element={<Navigate to="/executive" replace />} />
        <Route path="executive" element={<ExecLayout />}>
          <Route index element={<Overview />} />
          <Route path="platforms" element={<Navigate to="/executive/platforms/chatgpt" replace />} />
          <Route path="platforms/:platform" element={<PlatformDetail />} />
          <Route path="evidence" element={<Evidence />} />
          <Route path="missions" element={<Missions />} />
          <Route path="missions/team" element={<TeamWork />} />
          <Route path="missions/:id" element={<MissionDetail />} />
          <Route path="expert" element={<ExpertView />} />
        </Route>
        <Route path="*" element={<Placeholder />} />
      </Route>
    </Routes>
  )
}
