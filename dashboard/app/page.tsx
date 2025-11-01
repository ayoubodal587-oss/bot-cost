"use client"

import { format } from "date-fns"
import { CostMetrics } from "@/components/cost-metrics"
import { CostChart } from "@/components/cost-chart"
import { CostBreakdown } from "@/components/cost-breakdown"
import { LastUpdated } from "@/components/last-updated"

export default function Dashboard() {
  const today = format(new Date(), "EEEE, MMMM d, yyyy")

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border/50 bg-gradient-to-r from-card to-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="px-8 py-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                AWS Cost Intelligence
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                by MoroccoDev • <span className="text-primary font-medium">{today}</span>
              </p>
            </div>
          </div>
          <LastUpdated />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Metrics Grid */}
          <CostMetrics />

          {/* Chart and Breakdown */}
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
