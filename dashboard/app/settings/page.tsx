"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, CheckCircle, Circle } from "lucide-react"
import { SettingsSection } from "@/components/settings-section"
import { FormInput } from "@/components/form-input"
import { Toast } from "@/components/toast-notification"

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)

  // Slack Integration
  const [slackWebhook, setSlackWebhook] = useState("")
  const [slackConnected, setSlackConnected] = useState(false)

  // Report Schedule
  const [reportFrequency, setReportFrequency] = useState("daily")
  const [reportTime, setReportTime] = useState("09:00")
  const [timezone, setTimezone] = useState("UTC")
  const [intervalMinutes, setIntervalMinutes] = useState(5)

  // Budget Settings
  const [monthlyBudget, setMonthlyBudget] = useState(500)
  const [alertThreshold, setAlertThreshold] = useState(80)

  // AWS Configuration
  const [s3Bucket, setS3Bucket] = useState("my-aws-costs-bucket")
  const [region, setRegion] = useState("us-east-1")

  // AI Settings
  const [googleApiKey, setGoogleApiKey] = useState("sk-...")
  const [model, setModel] = useState("gemini-2.0-flash")

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const settings = await response.json()
          if (settings.slackWebhook) {
            setSlackWebhook(settings.slackWebhook)
            setSlackConnected(true)
          }
          if (settings.reportFrequency) setReportFrequency(settings.reportFrequency)
          if (settings.reportTime) setReportTime(settings.reportTime)
          if (settings.timezone) setTimezone(settings.timezone)
          if (settings.intervalMinutes) setIntervalMinutes(settings.intervalMinutes)
          if (settings.monthlyBudget) setMonthlyBudget(settings.monthlyBudget)
          if (settings.alertThreshold) setAlertThreshold(settings.alertThreshold)
          if (settings.s3Bucket) setS3Bucket(settings.s3Bucket)
          if (settings.region) setRegion(settings.region)
          if (settings.googleApiKey) setGoogleApiKey(settings.googleApiKey)
          if (settings.model) setModel(settings.model)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])

  const handleTestConnection = async () => {
    try {
      const response = await fetch('/api/settings/test-slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: slackWebhook }),
      })
      if (response.ok) {
        setSlackConnected(true)
        setToast({ message: "Slack connection successful!", type: "success" })
      } else {
        setSlackConnected(false)
        setToast({ message: "Failed to connect to Slack", type: "error" })
      }
    } catch (error) {
      setSlackConnected(false)
      setToast({ message: "Failed to connect to Slack", type: "error" })
    }
  }

  const handleSaveSettings = async (section: string) => {
    try {
      const settingsToSave = {
        slackWebhook,
        reportFrequency,
        reportTime,
        timezone,
        intervalMinutes,
        monthlyBudget,
        alertThreshold,
        s3Bucket,
        region,
        googleApiKey,
        model
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave),
      })

      if (response.ok) {
        setToast({ message: `${section} settings saved successfully!`, type: "success" })

        // If this is a report schedule change, send confirmation to webhook
        if (section === "Report Schedule") {
          sendScheduleConfirmation()
        }
      } else {
        setToast({ message: `Failed to save ${section} settings`, type: "error" })
      }
    } catch (error) {
      console.error('Save settings error:', error)
      setToast({ message: `Failed to save ${section} settings`, type: "error" })
    }
  }

  const sendScheduleConfirmation = async () => {
    try {
      const response = await fetch('/api/settings/test-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportFrequency, reportTime, timezone, intervalMinutes }),
      })
      if (!response.ok) {
        console.warn('Failed to send schedule confirmation')
      }
    } catch (error) {
      console.warn('Failed to send schedule confirmation:', error)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your AWS cost dashboard configuration</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8 space-y-6">
          {/* Slack Integration */}
          <SettingsSection title="Slack Integration">
            <div className="space-y-4">
              <FormInput
                label="Webhook URL"
                type={showApiKey ? "text" : "password"}
                value={slackWebhook}
                onChange={setSlackWebhook}
                placeholder="https://hooks.slack.com/services/..."
                icon={
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2">
                  {slackConnected ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-foreground">Connected</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-foreground">Disconnected</span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleTestConnection}
                  className="px-4 py-1 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Test Connection
                </button>
              </div>
            </div>
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => handleSaveSettings("Slack")}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </SettingsSection>

          {/* Report Schedule */}
          <SettingsSection title="Report Schedule">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Send reports</label>
                  <select
                    value={reportFrequency}
                    onChange={(e) => setReportFrequency(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="minutes">Every {intervalMinutes} minutes</option>
                    <option value="daily">Daily at {reportTime}</option>
                    <option value="weekly">Weekly (Monday)</option>
                    <option value="monthly">Monthly (1st)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="CST">CST</option>
                  </select>
                </div>
              </div>
              {reportFrequency === "minutes" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Interval (minutes)</label>
                  <select
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value={1}>Every 1 minute</option>
                    <option value={5}>Every 5 minutes</option>
                    <option value={10}>Every 10 minutes</option>
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                  </select>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {reportFrequency === "minutes"
                  ? `Reports will be sent every ${intervalMinutes} minute(s)`
                  : "Next scheduled report: Tomorrow at 9:00 AM UTC"
                }
              </p>
            </div>
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => handleSaveSettings("Report Schedule")}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </SettingsSection>

          {/* Budget Settings */}
          <SettingsSection title="Budget Settings">
            <div className="space-y-4">
              <FormInput
                label="Monthly Budget"
                type="number"
                value={monthlyBudget}
                onChange={(v) => setMonthlyBudget(Number(v))}
                placeholder="500"
              />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Alert Threshold</label>
                  <span className="text-sm font-semibold text-primary">{alertThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  You'll be notified when spending reaches {alertThreshold}% of your budget
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => handleSaveSettings("Budget")}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </SettingsSection>

          {/* AWS Configuration */}
          <SettingsSection title="AWS Configuration">
            <div className="space-y-4">
              <FormInput
                label="S3 Bucket Name"
                value={s3Bucket}
                onChange={setS3Bucket}
                placeholder="my-aws-costs-bucket"
                readOnly={true}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">AWS Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="us-east-1">us-east-1</option>
                  <option value="us-west-2">us-west-2</option>
                  <option value="eu-west-1">eu-west-1</option>
                  <option value="ap-southeast-1">ap-southeast-1</option>
                </select>
              </div>
              <p className="text-sm text-muted-foreground">Last sync: 2 hours ago</p>
            </div>
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => handleSaveSettings("AWS Configuration")}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </SettingsSection>

          {/* AI Settings */}
          <SettingsSection title="AI Settings">
            <div className="space-y-4">
              <FormInput
                label="Google API Key"
                type={showApiKey ? "text" : "password"}
                value={googleApiKey}
                onChange={setGoogleApiKey}
                placeholder="sk-..."
                icon={
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => handleSaveSettings("AI")}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </SettingsSection>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
