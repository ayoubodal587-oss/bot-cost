import { sendSlackAlert } from "@/lib/slack-client"
import { promises as fs } from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json')

async function getSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { reportFrequency, reportTime, timezone, intervalMinutes } = body

    const settings = await getSettings()
    const webhookUrl = settings.slackWebhook

    if (!webhookUrl) {
      return Response.json({ error: "Slack webhook not configured" }, { status: 400 })
    }

    const frequencyText = reportFrequency === "minutes"
      ? `every ${intervalMinutes} minute(s)`
      : reportFrequency

    const message = `✅ *Report Schedule Updated*\n\n📅 Frequency: ${frequencyText}\n🕐 Time: ${reportTime}\n🌍 Timezone: ${timezone}\n\nYour AWS cost reports will now be sent according to this schedule.`

    const success = await sendSlackAlert(message, "info", webhookUrl)

    if (success) {
      return Response.json({ success: true })
    } else {
      return Response.json({ error: "Failed to send confirmation" }, { status: 500 })
    }
  } catch (error) {
    console.error("Schedule test error:", error)
    return Response.json({ error: "Failed to send schedule confirmation" }, { status: 500 })
  }
}
