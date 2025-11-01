"use client"

import { useEffect, useState } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { format } from "date-fns"

interface ChartData {
  date: string
  cost: number
}

export function CostChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/cost")
        if (!response.ok) throw new Error("Failed to fetch data")
        const result = await response.json()
        setChartData(result.data.chartData)
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
      <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Cost Trend</h3>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
        </div>
        <div className="h-64 bg-muted/30 rounded animate-pulse" />
      </div>
    )

  if (error)
    return (
      <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Cost Trend</h3>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
        </div>
        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-destructive">
          <p className="font-medium">Error loading chart data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )

  const formattedData = chartData.map((item) => ({
    ...item,
    date: format(new Date(item.date), "MMM dd"),
  }))

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-lg p-6 transition-all duration-300 hover:border-border hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Cost Trend</h3>
          <p className="text-sm text-muted-foreground">Last {chartData.length} days</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
          <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: `1px solid var(--border)`,
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
            labelStyle={{ color: "var(--foreground)" }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost"]}
          />
          <Area type="monotone" dataKey="cost" stroke="var(--chart-1)" fill="url(#costGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
