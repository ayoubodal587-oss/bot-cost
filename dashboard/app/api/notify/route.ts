import { getCostReport, parseCostData } from "@/lib/aws-client"
import { sendCostAlert } from "@/lib/slack-client"
import { promises as fs } from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'dashboard', 'settings.json')

async function getSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

export async function POST() {
  try {
    const costData = await getCostReport()
    const parsedData = parseCostData(costData)

    const monthlyBudget = Number.parseFloat(process.env.MONTHLY_BUDGET || "1000")
    const alertThreshold = Number.parseFloat(process.env.ALERT_THRESHOLD || "70")

    const settings = await getSettings()
    const webhookUrl = settings.slackWebhook

    await sendCostAlert(parsedData.totalCost, monthlyBudget, alertThreshold, webhookUrl)

    return Response.json({
      success: true,
      costUsed: parsedData.totalCost,
      budget: monthlyBudget,
      threshold: alertThreshold,
    })
  } catch (error) {
    console.error("Notification error:", error)
    return Response.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
