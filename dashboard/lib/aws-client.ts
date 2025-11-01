import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { sdkStreamMixin } from "@aws-sdk/util-stream-node"

const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const bucket = process.env.COST_REPORT_BUCKET
const key = process.env.COST_REPORT_KEY

console.log("[v0] AWS Config Check:", {
  hasRegion: !!region,
  hasAccessKeyId: !!accessKeyId,
  hasSecretAccessKey: !!secretAccessKey,
  hasBucket: !!bucket,
  hasKey: !!key,
})

if (!region || !accessKeyId || !secretAccessKey || !bucket || !key) {
  console.error("[v0] Missing AWS environment variables:", {
    region: region ? "set" : "MISSING",
    accessKeyId: accessKeyId ? "set" : "MISSING",
    secretAccessKey: secretAccessKey ? "set" : "MISSING",
    bucket: bucket ? "set" : "MISSING",
    key: key ? "set" : "MISSING",
  })
}

const s3Client = new S3Client({
  region: region || "us-east-1",
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
})

export async function getCostReport() {
  try {
    console.log("[v0] Fetching cost report from S3:", { bucket, key })

    // Try to fetch from S3 first
    try {
      const command = new GetObjectCommand({
        Bucket: bucket!,
        Key: key!,
      })

      const response = await s3Client.send(command)

      let text = ""
      if (response.Body) {
        // Use the stream-to-string approach
        const reader = response.Body as any

        if (reader.pipe) {
          // It's a stream, use sdkStreamMixin
          const buffer = await sdkStreamMixin(response.Body as any).transformToByteArray()
          text = Buffer.from(buffer).toString("utf-8")
        } else if (typeof reader.text === "function") {
          // It's a Blob/Response-like object
          text = await reader.text()
        } else if (Buffer.isBuffer(reader)) {
          // It's already a buffer
          text = reader.toString("utf-8")
        } else {
          // Fallback: try to read it as a stream
          const chunks: any[] = []
          for await (const chunk of reader) {
            chunks.push(chunk)
          }
          text = Buffer.concat(chunks).toString("utf-8")
        }
      }

      if (!text) throw new Error("Empty response from S3")

      console.log("[v0] Successfully fetched cost report from S3")
      const parsed = JSON.parse(text)
      return parsed
    } catch (s3Error: any) {
      console.log("[v0] S3 fetch failed, falling back to local mock data:", s3Error?.message || s3Error)
    }

    // Fallback to local mock data
    const fs = require("fs")
    const path = require("path")

    try {
      const mockDataPath = path.join(process.cwd(), "mock-cost-data.json")
      const mockData = fs.readFileSync(mockDataPath, "utf-8")
      console.log("[v0] Successfully loaded local mock cost data")
      return JSON.parse(mockData)
    } catch (fileError) {
      console.error("[v0] Error reading local mock data:", fileError)
      throw new Error("Unable to fetch cost data from S3 or local mock file")
    }
  } catch (error) {
    console.error("[v0] Error fetching cost report:", error)
    throw error
  }
}

export function parseCostData(data: any) {
  // Handle AWS Cost Explorer format (ResultsByTime)
  if (data.ResultsByTime && Array.isArray(data.ResultsByTime)) {
    const dailyCosts = data.ResultsByTime.map((result: any) => ({
      date: result.TimePeriod.Start,
      total_cost: result.Total.BlendedCost?.Amount || result.Total.UnblendedCost?.Amount || 0,
    }))

    // Aggregate service costs across all time periods
    const serviceMap: { [key: string]: number } = {}
    data.ResultsByTime.forEach((result: any) => {
      if (result.Groups) {
        result.Groups.forEach((group: any) => {
          const service = group.Keys[0] // Assuming first key is service name
          const cost = Number.parseFloat(group.Metrics.BlendedCost?.Amount || group.Metrics.UnblendedCost?.Amount || 0)
          serviceMap[service] = (serviceMap[service] || 0) + cost
        })
      }
    })

    const serviceCosts = serviceMap

    const chartData = dailyCosts.map((entry: any) => ({
      date: entry.date,
      cost: Number.parseFloat(entry.total_cost),
    }))

    const serviceData = Object.entries(serviceCosts).map(([service, cost]: [string, number]) => ({
      name: service,
      value: cost,
    }))

    const totalCost = dailyCosts.reduce((sum: number, entry: any) => sum + Number.parseFloat(entry.total_cost), 0)
    const avgCost = totalCost / Math.max(dailyCosts.length, 1)

    return { chartData, serviceData, totalCost, avgCost }
  }

  // Handle mock data format (details array)
  if (data.details && Array.isArray(data.details)) {
    const dailyCosts = data.details.map((result: any) => ({
      date: result.TimePeriod.Start,
      total_cost: result.Total.BlendedCost.Amount,
    }))

    // For mock data, no service breakdown, so empty serviceData
    const serviceData: any[] = []

    const chartData = dailyCosts.map((entry: any) => ({
      date: entry.date,
      cost: Number.parseFloat(entry.total_cost),
    }))

    const totalCost = dailyCosts.reduce((sum: number, entry: any) => sum + Number.parseFloat(entry.total_cost), 0)
    const avgCost = totalCost / Math.max(dailyCosts.length, 1)

    return { chartData, serviceData, totalCost, avgCost }
  }

  // Fallback to original format
  const dailyCosts = data.daily_costs || []
  const serviceCosts = data.service_breakdown || {}

  const chartData = dailyCosts.map((entry: any) => ({
    date: entry.date,
    cost: Number.parseFloat(entry.total_cost),
  }))

  const serviceData = Object.entries(serviceCosts).map(([service, cost]: [string, any]) => ({
    name: service,
    value: Number.parseFloat(cost),
  }))

  const totalCost = dailyCosts.reduce((sum: number, entry: any) => sum + Number.parseFloat(entry.total_cost), 0)
  const avgCost = totalCost / Math.max(dailyCosts.length, 1)

  return { chartData, serviceData, totalCost, avgCost }
}
