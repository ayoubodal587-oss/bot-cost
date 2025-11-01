"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Save, CheckCircle } from "lucide-react"

export function SettingsForm() {
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    monthlyBudget: typeof window !== "undefined" ? localStorage.getItem("monthlyBudget") || "1000" : "1000",
    alertThreshold: typeof window !== "undefined" ? localStorage.getItem("alertThreshold") || "70" : "70",
    timezone:
      typeof window !== "undefined" ? localStorage.getItem("timezone") || "Africa/Casablanca" : "Africa/Casablanca",
    currency: typeof window !== "undefined" ? localStorage.getItem("currency") || "USD" : "USD",
    slackEnabled: typeof window !== "undefined" ? localStorage.getItem("slackEnabled") === "true" : true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Save to localStorage
    localStorage.setItem("monthlyBudget", formData.monthlyBudget)
    localStorage.setItem("alertThreshold", formData.alertThreshold)
    localStorage.setItem("timezone", formData.timezone)
    localStorage.setItem("currency", formData.currency)
    localStorage.setItem("slackEnabled", String(formData.slackEnabled))

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Budget Configuration</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Monthly Budget</label>
              <div className="flex items-center gap-2">
                <span className="text-foreground">{formData.currency}</span>
                <input
                  type="number"
                  name="monthlyBudget"
                  value={formData.monthlyBudget}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Alert Threshold (%)</label>
              <input
                type="number"
                name="alertThreshold"
                value={formData.alertThreshold}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                placeholder="70"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Timezone</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
              >
                <option>Africa/Casablanca</option>
                <option>Europe/London</option>
                <option>America/New_York</option>
                <option>America/Los_Angeles</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>MAD</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </form>
      </Card>

      <Card className="p-6 bg-card border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Integrations</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Slack Notifications</p>
              <p className="text-sm text-muted-foreground">Receive cost alerts on Slack</p>
            </div>
            <input
              type="checkbox"
              name="slackEnabled"
              checked={formData.slackEnabled}
              onChange={handleChange}
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">AI Insights</p>
              <p className="text-sm text-muted-foreground">Powered by Google Gemini 2.0</p>
            </div>
            <div className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded text-sm font-medium">Active</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">AWS Cost Explorer</p>
              <p className="text-sm text-muted-foreground">Connected to eu-north-1</p>
            </div>
            <div className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded text-sm font-medium">Connected</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
