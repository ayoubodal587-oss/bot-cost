"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, AlertCircle, Zap } from "lucide-react"
import { AlertBanner } from "@/components/alert-banner"

interface CostData {
  totalCost: number
  avgCost: number
  serviceData: any[]
  chartData: any[]
}

export function CostMetrics() {
  const [data, setData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/cost")
        if (!response.ok) throw new Error("Failed to fetch data")
        const result = await response.json()
        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading)
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/30 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/30 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  if (error)
    return (
      <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-destructive">
        <p className="font-medium">Error loading cost data</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  if (!data) return null

  const monthlyBudget = Number.parseFloat(process.env.NEXT_PUBLIC_MONTHLY_BUDGET || "1000")
  const budgetUsed = ((data.totalCost || 0) / monthlyBudget) * 100
  const isOverBudget = budgetUsed > 100
  const alertThreshold = Number.parseFloat(process.env.NEXT_PUBLIC_ALERT_THRESHOLD || "70")
  const isAlerted = budgetUsed > alertThreshold

  const metrics = [
    {
      label: "Total Spend (Month)",
      value: `$${data.totalCost?.toFixed(2) || "0.00"}`,
      subtext: `${data.chartData.length} days tracked`,
      icon: TrendingUp,
      color: "from-emerald-500/20 to-emerald-600/20",
      iconColor: "text-emerald-500",
    },
    {
      label: "Average Daily Cost",
      value: `$${data.avgCost?.toFixed(2) || "0.00"}`,
      subtext: `Projected: $${((data.avgCost || 0) * 30).toFixed(2)}/month`,
      icon: Zap,
      color: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-500",
    },
    {
      label: "Budget Usage",
      value: `${budgetUsed.toFixed(1)}%`,
      subtext: `$${(data.totalCost || 0).toFixed(2)} / $${monthlyBudget}`,
      icon: isAlerted ? AlertCircle : TrendingDown,
      color: isAlerted ? "from-red-500/20 to-red-600/20" : "from-green-500/20 to-green-600/20",
      iconColor: isAlerted ? "text-red-500" : "text-green-500",
    },
    {
      label: "Top Service",
      value: data.serviceData.length > 0 ? data.serviceData[0].name : "N/A",
      subtext: data.serviceData.length > 0 ? `$${(data.serviceData[0].value || 0).toFixed(2)}` : "No data",
      icon: TrendingUp,
      color: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-500",
    },
  ]

  return (
    <div className="space-y-6">
      <AlertBanner
        budgetUsed={budgetUsed}
        alertThreshold={alertThreshold}
        totalCost={data.totalCost}
        monthlyBudget={monthlyBudget}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div
              key={index}
              className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-lg p-6 transition-all duration-300 hover:border-border hover:shadow-xl group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium mb-2">{metric.label}</p>
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{metric.subtext}</p>
                </div>
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${metric.color} group-hover:scale-110 transition-all duration-300`}
                >
                  <Icon className={`w-5 h-5 ${metric.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
