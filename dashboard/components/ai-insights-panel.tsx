"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Lightbulb, RefreshCw, Copy, CheckCircle } from "lucide-react"

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await fetch("/api/insights")
        if (!response.ok) throw new Error("Failed to fetch insights")
        const result = await response.json()
        setInsights(result.insights)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/insights")
      if (!response.ok) throw new Error("Failed to fetch insights")
      const result = await response.json()
      setInsights(result.insights)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(insights)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-foreground">AI-Powered Insights</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Generating insights with AI...</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {insights}
          </div>
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Insights"}
          </button>
        </div>
      )}
    </Card>
  )
}
