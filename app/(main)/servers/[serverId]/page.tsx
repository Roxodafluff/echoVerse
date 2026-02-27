import { Hash } from 'lucide-react'

export default function ServerPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Hash className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Select a Channel</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Choose a channel from the sidebar to start chatting.
      </p>
    </div>
  )
}
