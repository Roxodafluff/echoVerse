'use client'

import { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmojiPicker } from './emoji-picker'

interface MessageInputProps {
  placeholder?: string
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({ placeholder = 'Send a message...', onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || sending) return

    setSending(true)
    try {
      await onSend(trimmed)
      setValue('')
      inputRef.current?.focus()
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleEmojiSelect(emoji: string) {
    setValue((v) => v + emoji)
    inputRef.current?.focus()
  }

  return (
    <div className="border-t border-border px-4 py-3">
      <div className="flex items-end gap-2 rounded-lg bg-secondary px-3 py-2">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="max-h-32 flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          aria-label={placeholder}
        />
        <EmojiPicker onSelect={handleEmojiSelect} />
        <Button
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleSubmit}
          disabled={!value.trim() || sending || disabled}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
