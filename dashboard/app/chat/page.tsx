"use client"

import { useState, useRef, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { ConversationStarters } from "@/components/conversation-starters"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Fetch cost data and generate AI response
      const response = await fetch('/api/insights')
      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Based on your AWS cost data from S3 (${process.env.COST_REPORT_BUCKET}/${process.env.COST_REPORT_KEY}):\n\n${data.insights}\n\nTotal Cost: $${(data.data.totalCost || 0).toFixed(2)}\nAverage Daily Cost: $${(data.data.avgCost || 0).toFixed(2)}\n\nWould you like me to analyze specific aspects of your costs?`,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || 'Failed to fetch insights')
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while analyzing your cost data. Please check your AWS credentials and S3 bucket configuration.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearConversation = () => {
    setMessages([])
  }

  const quickActions = ["This Week", "Last Month", "EC2 Costs"]

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="px-8 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">AI Cost Assistant</h1>
          <button
            onClick={handleClearConversation}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="h-full flex flex-col">
          {messages.length === 0 ? (
            // Empty State
            <div className="flex-1 flex">
              {/* Left: Conversation Starters */}
              <div className="w-1/3 border-r border-border p-8 overflow-auto">
                <ConversationStarters onSelect={handleSendMessage} />
              </div>

              {/* Right: Quick Actions */}
              <div className="flex-1 p-8 flex flex-col items-center justify-center">
                <div className="max-w-md">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Welcome</h2>
                  <p className="text-muted-foreground mb-8">
                    Ask me questions about your AWS costs and I'll help you understand your spending patterns.
                  </p>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground mb-3">Quick Actions:</p>
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(action)}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left text-sm text-foreground font-medium"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Chat View
            <div className="flex-1 flex">
              {/* Left: Conversation Starters */}
              <div className="w-1/3 border-r border-border p-8 overflow-auto">
                <ConversationStarters onSelect={handleSendMessage} />
              </div>

              {/* Right: Messages */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto p-8 space-y-4">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} role={message.role} content={message.content} />
                  ))}
                  {isLoading && <ChatMessage role="assistant" content="Analyzing cost data..." isLoading={true} />}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-border bg-card p-8">
                  <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
