"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotificationPopover() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (Array.isArray(data)) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) return

    setLoading(true)
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: unreadIds })
      })
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(!open)}>
        <Bell className="h-5 w-5 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-500"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark all as read"}
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`flex gap-3 border-b p-4 last:border-0 dark:border-gray-800 ${n.read ? 'opacity-60' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                    <div className="mt-0.5 shrink-0">
                      <div className={`flex h-2 w-2 rounded-full ${n.read ? 'bg-transparent' : 'bg-red-500'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
                      <p className="mt-1 text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
