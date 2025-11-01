"use client"

import { AlertCircle, TrendingUp, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AlertBannerProps {
  budgetUsed: number
  alertThreshold: number
  totalCost: number
  monthlyBudget: number
}

export function AlertBanner({ budgetUsed, alertThreshold, totalCost, monthlyBudget }: AlertBannerProps) {
  if (budgetUsed <= alertThreshold) {
    return (
      <Alert className="border-green-500/30 bg-green-500/5">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-400">
          Good news! Your spending is within budget at {budgetUsed.toFixed(1)}% utilization.
        </AlertDescription>
      </Alert>
    )
  }

  if (budgetUsed > 100) {
    return (
      <Alert className="border-red-500/30 bg-red-500/5">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-400">
          ⚠️ You have exceeded your monthly budget by ${(totalCost - monthlyBudget).toFixed(2)}. Current usage:{" "}
          {budgetUsed.toFixed(1)}%
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-yellow-500/30 bg-yellow-500/5">
      <TrendingUp className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="text-yellow-400">
        ⚡ You're approaching your budget limit at {budgetUsed.toFixed(1)}% utilization. {alertThreshold}% is your
        threshold.
      </AlertDescription>
    </Alert>
  )
}
