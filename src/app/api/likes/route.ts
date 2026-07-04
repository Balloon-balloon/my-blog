import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 点赞/取消点赞
export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json()

    if (!postId) {
      return NextResponse.json(
        { error: '文章ID不能为空' },
        { status: 400 }
      )
    }

    // 使用客户端 IP 作为用户标识
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown'
    const postIdInt = parseInt(postId)

    // 检查是否已点赞
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: postIdInt,
        OR: [
          { guestIp: ip },
        ]
      }
    })

    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: { id: existingLike.id }
      })

      const count = await prisma.like.count({
        where: { postId: postIdInt }
      })

      return NextResponse.json({ liked: false, count })
    } else {
      // 点赞
      await prisma.like.create({
        data: {
          guestIp: ip,
          postId: postIdInt
        }
      })

      const count = await prisma.like.count({
        where: { postId: postIdInt }
      })

      return NextResponse.json({ liked: true, count })
    }
  } catch (error) {
    console.error('点赞错误:', error)
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    )
  }
}

// 检查是否已点赞
export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown'

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: '文章ID不能为空' },
        { status: 400 }
      )
    }

    const like = await prisma.like.findFirst({
      where: {
        postId: parseInt(postId),
        guestIp: ip,
      }
    })

    const count = await prisma.like.count({
      where: { postId: parseInt(postId) }
    })

    return NextResponse.json({ liked: !!like, count })
  } catch (error) {
    console.error('检查点赞状态错误:', error)
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    )
  }
}
