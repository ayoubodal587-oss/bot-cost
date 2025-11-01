import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function generateCostInsights(costData: any): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GOOGLE_MODEL! })

    const prompt = `Analyze these AWS cost data and provide actionable insights:
Total Cost: $${(costData.totalCost || 0).toFixed(2)}
Average Daily Cost: $${(costData.avgCost || 0).toFixed(2)}
Service Breakdown: ${JSON.stringify(costData.serviceData)}
Recent Daily Costs: ${JSON.stringify(costData.chartData.slice(-7))}

Provide:
1. Key cost drivers
2. Cost optimization recommendations
3. Trend analysis
4. Budget alert if needed

Keep response concise and actionable.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return text
  } catch (error) {
    console.error("Error generating insights:", error)
    throw error
  }
}

export async function analyzeCostAnomalies(costData: any): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GOOGLE_MODEL! })

    const recentCosts = costData.chartData.slice(-7)
    const avgRecent = recentCosts.length > 0 ? recentCosts.reduce((sum: number, d: any) => sum + d.cost, 0) / recentCosts.length : 0

    const prompt = `Identify cost anomalies in this AWS data:
Recent 7-day average: $${avgRecent.toFixed(2)}
Daily breakdown: ${JSON.stringify(recentCosts)}

Identify any spikes or unusual patterns and suggest remediation steps.`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error("Error analyzing anomalies:", error)
    throw error
  }
}
