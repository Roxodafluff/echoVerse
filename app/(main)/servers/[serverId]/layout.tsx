'use client'

import { ChannelSidebar } from '@/components/layout/channel-sidebar'
import { MemberSidebar } from '@/components/layout/member-sidebar'

export default function ServerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ChannelSidebar />
      <main className="flex flex-1 flex-col overflow-hidden bg-echoverse-chat">
        {children}
      </main>
      <MemberSidebar />
    </>
  )
}
