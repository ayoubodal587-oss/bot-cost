import { sendSlackAlert } from "@/lib/slack-client"

export async function POST(request: Request) {
  try {
    const { webhookUrl } = await request.json()

    if (!webhookUrl) {
      return Response.json({ error: "Webhook URL is required" }, { status: 400 })
    }

    const success = await sendSlackAlert("Test connection from AWS Cost Dashboard", "info", webhookUrl)

    if (success) {
      return Response.json({ success: true })
    } else {
      return Response.json({ error: "Failed to send test message" }, { status: 500 })
    }
  } catch (error) {
    console.error("Test Slack error:", error)
    return Response.json({ error: "Failed to test Slack connection" }, { status: 500 })
  }
}
