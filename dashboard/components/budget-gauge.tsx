"use client"

import { Card } from "@/components/ui/card"

interface BudgetGaugeProps {
  used: number
  total: number
}

export function BudgetGauge({ used, total }: BudgetGaugeProps) {
  const percentage = Math.min((used / total) * 100, 100)
  const getColor = () => {
    if (percentage <= 70) return "bg-emerald-500"
    if (percentage <= 90) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="p-4 bg-card border border-border">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Monthly Budget</span>
          <span className="text-sm text-muted-foreground">
            ${used.toFixed(2)} / ${total.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${getColor()} transition-all duration-500 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of budget used</div>
      </div>
    </Card>
  )
}
