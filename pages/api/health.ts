import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const count = await prisma.post.count()
    res.status(200).json({
      status: 'ok',
      dbConnected: true,
      postCount: count,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error?.message || String(error),
      stack: error?.stack?.split('\n').slice(0, 5),
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    })
  }
}
