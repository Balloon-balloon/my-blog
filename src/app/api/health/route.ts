import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const count = await prisma.post.count()
    return NextResponse.json({ 
      status: 'ok', 
      dbConnected: true, 
      postCount: count,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error?.message || String(error),
      stack: error?.stack?.split('\n').slice(0, 5),
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    }, { status: 500 })
  }
}
