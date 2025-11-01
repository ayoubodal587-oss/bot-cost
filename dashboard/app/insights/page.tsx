"use client"

import { format } from "date-fns"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { CostChart } from "@/components/cost-chart"
import { CostBreakdown } from "@/components/cost-breakdown"

export default function InsightsPage() {
  const today = format(new Date(), "EEEE, MMMM d, yyyy")

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cost Insights</h1>
              <p className="text-sm text-muted-foreground mt-1">AI-powered analysis and recommendations • {today}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* AI Insights */}
          <AIInsightsPanel />

          {/* Charts and breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CostChart />
            </div>
            <div>
              <CostBreakdown />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
