import { MessageSquare } from 'lucide-react'

export default function DmsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-echoverse-chat text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <MessageSquare className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Direct Messages</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Select a conversation from the sidebar or start a new one from the Friends page.
      </p>
    </div>
  )
}
