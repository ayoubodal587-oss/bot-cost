"use client"

import { BarChart3, LineChartIcon, AreaChartIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChartTypeToggleProps {
  value: "line" | "bar" | "area"
  onChange: (type: "line" | "bar" | "area") => void
}

export function ChartTypeToggle({ value, onChange }: ChartTypeToggleProps) {
  const types = [
    { id: "line", label: "Line", icon: LineChartIcon },
    { id: "bar", label: "Bar", icon: BarChart3 },
    { id: "area", label: "Area", icon: AreaChartIcon },
  ] as const

  return (
    <div className="flex gap-2 bg-muted rounded-lg p-1">
      {types.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded transition-colors text-sm font-medium",
            value === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
