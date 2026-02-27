import { MessageSquare } from 'lucide-react'

export default function ServersPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <MessageSquare className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Welcome to EchoVerse</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Select a server from the sidebar or create a new one to get started.
      </p>
    </div>
  )
}
