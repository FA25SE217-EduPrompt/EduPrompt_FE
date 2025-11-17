"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, BookOpen, Tag, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Package, label: "group", href: "/dashboard/group" }, 
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-gray-200 bg-white text-gray-700">
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <LayoutDashboard className="w-6 h-6" />
          Dashboard
        </Link>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 mt-auto">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Về Trang Chủ</span>
        </Link>
      </div>
    </aside>
  )
}
