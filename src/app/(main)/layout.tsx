import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 dark:bg-gray-900/50">
          {children}
        </main>
      </div>
    </div>
  )
}
