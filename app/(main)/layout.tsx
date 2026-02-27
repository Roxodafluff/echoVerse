'use client'

import { ServerBar } from '@/components/layout/server-bar'
import { CreateServerDialog } from '@/components/server/create-server-dialog'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ServerBar />
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
      <CreateServerDialog />
    </div>
  )
}
