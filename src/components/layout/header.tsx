"use client"

import { signOut } from "next-auth/react"
import { Bell, LogOut, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-gray-50/40 px-6 dark:bg-gray-800/40 justify-between">
      <div className="flex-1">
        {/* Search or breadcrumbs could go here */}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600"></span>
        </Button>
        <div className="flex items-center gap-2 border-l pl-4 dark:border-gray-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            <UserIcon className="h-4 w-4" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
