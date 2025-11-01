"use client"

import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
}

export function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-md px-4 py-3 rounded-lg ${
          role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-200" />
            </div>
            <span className="text-sm">Analyzing cost data...</span>
          </div>
        ) : (
          <div>
            <p className="text-sm whitespace-pre-wrap">{content}</p>
            {role === "assistant" && (
              <button
                onClick={handleCopy}
                className="mt-2 flex items-center gap-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
