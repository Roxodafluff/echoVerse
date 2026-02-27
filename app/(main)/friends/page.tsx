'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FriendsList } from '@/components/friends/friends-list'
import { PendingRequests } from '@/components/friends/pending-requests'
import { AddFriend } from '@/components/friends/add-friend'
import { getFriends, getPendingRequests } from '@/lib/queries/friends'
import { createClient } from '@/lib/supabase/client'
import type { FriendRequest } from '@/lib/types'
import { Users } from 'lucide-react'

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendRequest[]>([])
  const [pending, setPending] = useState<FriendRequest[]>([])
  const [userId, setUserId] = useState<string>('')

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const [f, p] = await Promise.all([getFriends(), getPendingRequests()])
    setFriends(f)
    setPending(p)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-echoverse-chat">
      <header className="flex h-12 items-center gap-2 border-b border-border px-6">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-sm font-semibold text-foreground">Friends</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pending.length > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {pending.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="add">Add Friend</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <FriendsList
              friends={friends}
              currentUserId={userId}
              onRefresh={fetchData}
              filter="all"
            />
          </TabsContent>

          <TabsContent value="online" className="mt-4">
            <FriendsList
              friends={friends}
              currentUserId={userId}
              onRefresh={fetchData}
              filter="online"
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <PendingRequests
              requests={pending}
              currentUserId={userId}
              onRefresh={fetchData}
            />
          </TabsContent>

          <TabsContent value="add" className="mt-4">
            <AddFriend currentUserId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
