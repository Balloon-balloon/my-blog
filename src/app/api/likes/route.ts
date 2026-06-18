import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// 点赞/取消点赞
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const { postId } = await req.json()

    if (!postId) {
      return NextResponse.json(
        { error: '文章ID不能为空' },
        { status: 400 }
      )
    }

    const userId = parseInt(session.user.id)
    const postIdInt = parseInt(postId)

    // 检查是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: postIdInt
        }
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
          userId,
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ liked: false })
    }

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: '文章ID不能为空' },
        { status: 400 }
      )
    }

    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: parseInt(session.user.id),
          postId: parseInt(postId)
        }
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