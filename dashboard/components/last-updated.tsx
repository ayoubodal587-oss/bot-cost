"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LastUpdatedProps {
  onRefresh?: () => void
}

export function LastUpdated({ onRefresh }: LastUpdatedProps) {
  const [lastUpdate, setLastUpdate] = useState<string>("just now")
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setLastUpdate(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    if (onRefresh) await onRefresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">Last updated: {lastUpdate}</span>
      <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="h-8 w-8 p-0">
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      </Button>
    </div>
  )
}
