"use client"

import type React from "react"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-card hover:bg-muted transition-colors"
      >
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "" : "-rotate-90"}`} />
      </button>

      {isOpen && <div className="border-t border-border bg-card/50 px-6 py-4 space-y-4">{children}</div>}
    </div>
  )
}
