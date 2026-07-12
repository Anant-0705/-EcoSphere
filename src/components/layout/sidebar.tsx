"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Leaf,
  Users,
  ShieldCheck,
  Trophy,
  FileText,
  Settings,
} from "lucide-react"
import { canViewOrgReports } from "@/lib/rbac"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: null as string[] | null },
  { name: "Environmental", href: "/environmental", icon: Leaf, roles: null },
  { name: "Social", href: "/social", icon: Users, roles: null },
  { name: "Governance", href: "/governance", icon: ShieldCheck, roles: null },
  { name: "Gamification", href: "/gamification", icon: Trophy, roles: null },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    roles: ["ADMIN", "MANAGER", "AUDITOR"],
  },
  { name: "Settings", href: "/settings", icon: Settings, roles: null },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role

  const items = navigation.filter((item) => {
    if (!item.roles) return true
    if (!role) return false
    if (item.href === "/reports") return canViewOrgReports(role)
    return item.roles.includes(role)
  })

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gray-50/40 dark:bg-gray-800/40">
      <div className="flex h-14 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold text-emerald-600 dark:text-emerald-500"
        >
          <Leaf className="h-6 w-6" />
          <span>EcoSphere</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4 text-sm font-medium">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isActive
                    ? "bg-gray-100 text-emerald-600 dark:bg-gray-800 dark:text-emerald-500"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        {role && (
          <p className="mt-4 px-7 text-xs text-gray-400">
            Signed in as <span className="font-medium text-gray-500">{role}</span>
          </p>
        )}
      </div>
    </div>
  )
}
