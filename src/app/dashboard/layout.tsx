
import DashboardSidebar from "@/components/layout/Dashboard-sidebar"
import type React from "react" 

export const metadata = {
  title: "dashboard - Quản Lý  ",
  description: "Bảng điều khiển quản lý  ",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
