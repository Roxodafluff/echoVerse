'use client'

import { useParams } from 'next/navigation'
import { DmChat } from '@/components/dm/dm-chat'

export default function DmConversationPage() {
  const params = useParams()
  const conversationId = params?.conversationId as string

  return <DmChat conversationId={conversationId} />
}
