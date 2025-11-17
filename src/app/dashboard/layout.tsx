
import DashboardSidebar from "@/components/layout/Dashboard-sidebar"
import type React from "react" 

export const metadata = {
  title: "Admin - Quản Lý Nội Thất Gỗ",
  description: "Bảng điều khiển quản lý sản phẩm, blog và dự án",
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
