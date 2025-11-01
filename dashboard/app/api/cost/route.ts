import { getCostReport, parseCostData } from "@/lib/aws-client"

export async function GET() {
  try {
    console.log("[v0] Cost API: Starting fetch")

    const costData = await getCostReport()
    console.log("[v0] Cost API: Data fetched successfully")

    const parsedData = parseCostData(costData)
    console.log("[v0] Cost API: Data parsed successfully")

    return Response.json({
      success: true,
      data: parsedData,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] Cost API error:", {
      message: error?.message,
      code: error?.code,
      statusCode: error?.$metadata?.httpStatusCode,
    })

    return Response.json(
      {
        error: "Failed to fetch cost data",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
