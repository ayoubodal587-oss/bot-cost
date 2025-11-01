import { promises as fs } from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json')

interface Settings {
  slackWebhook?: string
  reportFrequency?: string
  reportTime?: string
  timezone?: string
  intervalMinutes?: number
  monthlyBudget?: number
  alertThreshold?: number
  s3Bucket?: string
  region?: string
  googleApiKey?: string
  model?: string
}

async function readSettings(): Promise<Settings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

async function writeSettings(settings: Settings): Promise<void> {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))
}

export async function GET() {
  try {
    const settings = await readSettings()
    return Response.json(settings)
  } catch (error) {
    console.error('Error reading settings:', error)
    return Response.json({ error: 'Failed to read settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const currentSettings = await readSettings()
    const newSettings = { ...currentSettings, ...body }
    await writeSettings(newSettings)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error saving settings:', error)
    return Response.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
