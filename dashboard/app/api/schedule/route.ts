import { promises as fs } from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'dashboard', 'settings.json')

interface ScheduleRequest {
  action: 'create' | 'update' | 'delete'
  interval_minutes: number
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

    // Here you would call the dynamic scheduler Lambda
    // For now, we'll simulate the response
    const response = {
      status: 'success',
      message: `Schedule ${action}d for every ${interval_minutes} minutes`,
      action,
      interval_minutes,
      timestamp: new Date().toISOString()
    }

    // TODO: Actually invoke the Lambda function
    // This would require AWS SDK and proper credentials

    return Response.json(response)
  } catch (error) {
    console.error('Schedule API error:', error)
    return Response.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // TODO: Call Lambda to get current schedule status
    // For now, return mock data
    const currentSchedule = {
      rule_exists: false,
      interval_minutes: 5,
      status: 'not_implemented_yet'
    }

    return Response.json(currentSchedule)

  } catch (error) {
    console.error('Get schedule error:', error)
    return Response.json({ error: 'Failed to get schedule' }, { status: 500 })
  }
}
