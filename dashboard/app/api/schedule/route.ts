import { promises as fs } from 'fs'
import path from 'path'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'

const SETTINGS_FILE = path.join(process.cwd(), 'dashboard', 'settings.json')

// Initialize Lambda client
const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION || 'us-east-1'
})

interface ScheduleRequest {
  action: 'create' | 'update' | 'delete'
  interval_minutes: number
}

async function invokeDynamicScheduler(action: string, intervalMinutes: number) {
  try {
    const payload = {
      action,
      interval_minutes: intervalMinutes,
      rule_name: 'cost-report-schedule-dynamic',
      lambda_arn: process.env.COST_REPORT_LAMBDA_ARN
    }

    const command = new InvokeCommand({
      FunctionName: 'dynamic-scheduler', // Lambda function name
      Payload: JSON.stringify(payload)
    })

    const response = await lambdaClient.send(command)
    const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload))

    return responsePayload
  } catch (error) {
    console.error('Error invoking dynamic scheduler:', error)
    return {
      status: 'error',
      message: `Failed to ${action} schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

export async function POST(request: Request) {
  try {
    const body: ScheduleRequest = await request.json()
    const { action, interval_minutes } = body

    // Validate input
    if (!['create', 'update', 'delete'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (action !== 'delete' && (!interval_minutes || interval_minutes < 1)) {
      return Response.json({ error: 'Invalid interval_minutes' }, { status: 400 })
    }

    // Read current settings to get webhook URL for confirmation
    let settings = {}
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf8')
      settings = JSON.parse(data)
    } catch {
      // Settings file doesn't exist or is empty
    }

    // Call the dynamic scheduler Lambda
    const lambdaResponse = await invokeDynamicScheduler(action, interval_minutes)

    const response = {
      status: lambdaResponse.status,
      message: lambdaResponse.message || `Schedule ${action}d for every ${interval_minutes} minutes`,
      action,
      interval_minutes,
      timestamp: new Date().toISOString(),
      lambda_response: lambdaResponse
    }

    return Response.json(response)
  } catch (error) {
    console.error('Schedule API error:', error)
    return Response.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Call the dynamic scheduler Lambda to get current schedule status
    const payload = {
      action: 'get_status'
    }

    const command = new InvokeCommand({
      FunctionName: 'dynamic-scheduler',
      Payload: JSON.stringify(payload)
    })

    const response = await lambdaClient.send(command)
    const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload))

    return Response.json(responsePayload)

  } catch (error) {
    console.error('Get schedule error:', error)
    return Response.json({
      rule_exists: false,
      interval_minutes: 5,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
