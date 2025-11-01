"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { ChartTypeToggle } from "@/components/chart-type-toggle"
import { HistoryChart } from "@/components/history-chart"

export default function CostHistoryPage() {
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line")
  const [dateRange, setDateRange] = useState<"7" | "30" | "90" | "custom">("30")
  const [costThreshold, setCostThreshold] = useState<number>(0)

  const historyData = [
    {
      date: "Oct 30, 2024",
      cost: "$342.50",
      change: "+2.1%",
      topService: "EC2",
    },
    {
      date: "Oct 29, 2024",
      cost: "$333.10",
      change: "-1.5%",
      topService: "S3",
    },
    {
      date: "Oct 28, 2024",
      cost: "$338.50",
      change: "+3.2%",
      topService: "RDS",
    },
    {
      date: "Oct 27, 2024",
      cost: "$328.90",
      change: "-0.8%",
      topService: "Lambda",
    },
    {
      date: "Oct 26, 2024",
      cost: "$331.50",
      change: "+1.2%",
      topService: "EC2",
    },
  ]

  const handleExport = () => {
    const csv = [
      ["Date", "Cost", "Change %", "Top Service"],
      ...historyData.map((row) => [row.date, row.cost, row.change, row.topService]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cost-history.csv"
    a.click()
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Cost History</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          {/* Filters */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Cost Threshold */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cost Threshold (${costThreshold})
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={costThreshold}
                  onChange={(e) => setCostThreshold(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Export Button */}
              <div className="flex items-end">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Cost Visualization</h2>
            <ChartTypeToggle value={chartType} onChange={setChartType} />
          </div>

          {/* Chart */}
          <HistoryChart type={chartType} data={[]} />

          {/* Data Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Daily Costs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Total Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Change %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Top Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((row, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 text-foreground">{row.date}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{row.cost}</td>
                      <td
                        className={`px-6 py-4 font-medium ${
                          row.change.startsWith("+") ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {row.change}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-muted rounded-full text-sm text-foreground">
                          {row.topService}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-primary hover:text-primary-foreground transition-colors text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
