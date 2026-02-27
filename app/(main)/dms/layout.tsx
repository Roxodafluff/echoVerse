'use client'

import { DmList } from '@/components/dm/dm-list'

export default function DmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DmList />
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </>
  )
}
