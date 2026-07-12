"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Leaf, Users, ShieldCheck, Trophy, FileText, Settings } from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Environmental', href: '/environmental', icon: Leaf },
  { name: 'Social', href: '/social', icon: Users },
  { name: 'Governance', href: '/governance', icon: ShieldCheck },
  { name: 'Gamification', href: '/gamification', icon: Trophy },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gray-50/40 dark:bg-gray-800/40">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg text-emerald-600 dark:text-emerald-500">
          <Leaf className="h-6 w-6" />
          <span>EcoSphere</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4 text-sm font-medium">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
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
      </div>
    </div>
  )
}
