"use client"

import { Check, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface ToastProps {
  message: string
  type: "success" | "error"
  duration?: number
}

export function Toast({ message, type, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration)
    return () => clearTimeout(timer)
  }, [duration])

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg border ${
        type === "success"
          ? "bg-green-500/10 border-green-500/30 text-green-500"
          : "bg-red-500/10 border-red-500/30 text-red-500"
      }`}
    >
      {type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}
