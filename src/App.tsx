import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import { Spinner } from './components/ui'
import AssignWork from './pages/AssignWork'
import BossDashboard from './pages/BossDashboard'
import BossProgress from './pages/BossProgress'
import CreateWork from './pages/CreateWork'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import SignUp from './pages/SignUp'
import TaskDetail from './pages/TaskDetail'
import WorkerDashboard from './pages/WorkerDashboard'
import WorkerTasks from './pages/WorkerTasks'
import Workers from './pages/Workers'
import { useSession } from './session'

function BossOnly({ children }: { children: ReactNode }) {
  const { profile } = useSession()
  return profile?.role === 'boss' ? children : <Navigate to="/" replace />
}

export default function App() {
  const { profile, isRestoring } = useSession()

  if (isRestoring) return <div className="center-screen"><Spinner /></div>

  if (!profile) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={profile.role === 'boss' ? <BossDashboard /> : <WorkerDashboard />} />
        <Route path="tasks" element={<WorkerTasks />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="work/new" element={<BossOnly><CreateWork /></BossOnly>} />
        <Route path="work/assign" element={<BossOnly><AssignWork /></BossOnly>} />
        <Route path="progress" element={<BossOnly><BossProgress /></BossOnly>} />
        <Route path="workers" element={<BossOnly><Workers /></BossOnly>} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
