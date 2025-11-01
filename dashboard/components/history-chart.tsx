"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface HistoryChartProps {
  type: "line" | "bar" | "area"
  data: Array<{
    date: string
    cost: number
  }>
}

const chartData = [
  { date: "Oct 4", cost: 310 },
  { date: "Oct 11", cost: 295 },
  { date: "Oct 18", cost: 325 },
  { date: "Oct 25", cost: 318 },
  { date: "Nov 1", cost: 342 },
]

export function HistoryChart({ type }: HistoryChartProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <ResponsiveContainer width="100%" height={350}>
        {type === "line" && (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Line type="monotone" dataKey="cost" stroke="var(--chart-1)" strokeWidth={2} />
          </LineChart>
        )}

        {type === "bar" && (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Bar dataKey="cost" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}

        {type === "area" && (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Area type="monotone" dataKey="cost" fill="var(--chart-1)" stroke="var(--chart-2)" />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
