"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface ServiceData {
  name: string
  value: number
}

export function CostBreakdown() {
  const [data, setData] = useState<ServiceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/cost")
        if (!response.ok) throw new Error("Failed to fetch")
        const result = await response.json()
        setData(result.data.serviceData || [])
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <Card className="p-6 bg-card border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Service Cost Breakdown</h3>
      {loading ? (
        <div className="text-muted-foreground">Loading breakdown...</div>
      ) : data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name }) => name}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-muted-foreground">No service data available</div>
      )}
    </Card>
  )
}
