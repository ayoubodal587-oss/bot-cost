import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isUp: boolean
  }
  variant?: "default" | "progress"
  progressValue?: number
}

export function MetricCard({ title, value, subtitle, trend, variant = "default", progressValue }: MetricCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {trend && (
          <div className="flex items-center gap-1">
            {trend.isUp ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-500" />
            )}
            <span className={trend.isUp ? "text-red-500" : "text-green-500"}>{trend.value}%</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      {variant === "progress" && progressValue !== undefined && (
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      )}
    </div>
  )
}
