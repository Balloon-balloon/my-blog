import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function GET() {
  try {
    // Run prisma db push to create tables
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'pipe',
    })
    return NextResponse.json({ message: 'Database initialized successfully' })
  } catch (error) {
    console.error('DB init error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    )
  }
}
