import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AmbientGlow from '../components/AmbientGlow'
import FloatingUserBubble from '../components/FloatingUserBubble'

export default function DashboardLayout() {
  return (
    <div className="h-full min-h-0 bg-void flex flex-col overflow-hidden rounded-[28px] border border-hairline/70 shadow-[0_20px_60px_rgba(35,28,23,0.08)] backdrop-blur-2xl relative">
      <AmbientGlow />
      <Navbar />
      <div className="flex-1 overflow-hidden flex flex-col relative z-10">
        <Outlet />
      </div>
      <FloatingUserBubble />
    </div>
  )
}
