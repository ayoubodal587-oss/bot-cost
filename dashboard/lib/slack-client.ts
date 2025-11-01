export async function sendSlackAlert(message: string, type: "info" | "warning" | "error" = "info", webhookUrl?: string) {
  const slackWebhookUrl = webhookUrl || process.env.SLACK_WEBHOOK_URL

  if (!slackWebhookUrl) {
    console.warn("Slack webhook URL not configured")
    return
  }

  try {
    const color = {
      info: "#3B82F6",
      warning: "#F59E0B",
      error: "#EF4444",
    }[type]

    const payload = {
      attachments: [
        {
          color,
          title: "AWS Cost Alert",
          text: message,
          footer: "AWS Cost Intelligence by MoroccoDev",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }

    const response = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error("Failed to send Slack notification")
    return true
  } catch (error) {
    console.error("Slack notification error:", error)
    return false
  }
}

export async function sendCostAlert(totalCost: number, monthlyBudget: number, threshold: number, webhookUrl?: string) {
  const percentUsed = (totalCost / monthlyBudget) * 100

  if (percentUsed > threshold) {
    const message = `⚠️ Budget Alert: You've used ${percentUsed.toFixed(1)}% of your monthly budget ($${totalCost.toFixed(2)} of $${monthlyBudget})`
    await sendSlackAlert(message, "warning", webhookUrl)
  }
}
