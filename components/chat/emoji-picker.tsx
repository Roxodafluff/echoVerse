'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Smile } from 'lucide-react'

const EMOJI_LIST = [
  '😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡',
  '👍', '👎', '❤️', '🔥', '🎉', '🙌', '💯', '✨',
  '😊', '🤣', '😭', '🥺', '😱', '🤯', '🤩', '😴',
  '👀', '🙈', '💀', '☠️', '🤡', '👻', '🎃', '🤖',
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Add emoji">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="end">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-lg hover:bg-accent"
              aria-label={`Emoji ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
