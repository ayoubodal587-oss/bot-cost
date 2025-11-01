import { getCostReport, parseCostData } from "@/lib/aws-client"
import { generateCostInsights } from "@/lib/gemini-client"

export async function GET() {
  try {
    const costData = await getCostReport()
    const parsedData = parseCostData(costData)
    const insights = await generateCostInsights(parsedData)

    return Response.json({
      success: true,
      insights,
      data: parsedData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Insights API error:", error)
    return Response.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
