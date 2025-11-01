"use client"

import { Sparkles } from "lucide-react"

interface ConversationStartersProps {
  onSelect: (starter: string) => void
}

export function ConversationStarters({ onSelect }: ConversationStartersProps) {
  const starters = [
    "Why did costs increase last week?",
    "Show me EC2 spending trend",
    "Compare this month vs last month",
    "What are my top 3 cost drivers?",
  ]

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-foreground">Conversation Starters</h3>
      </div>
      {starters.map((starter, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(starter)}
          className="w-full p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left text-sm text-foreground hover:text-primary font-medium"
        >
          {starter}
        </button>
      ))}
    </div>
  )
}
