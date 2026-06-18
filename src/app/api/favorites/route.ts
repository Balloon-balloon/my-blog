import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// 收藏/取消收藏
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

    // 检查是否已收藏
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: postIdInt
        }
      }
    })

    if (existingFavorite) {
      // 取消收藏
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      })

      const count = await prisma.favorite.count({
        where: { postId: postIdInt }
      })

      return NextResponse.json({ favorited: false, count })
    } else {
      // 收藏
      await prisma.favorite.create({
        data: {
          userId,
          postId: postIdInt
        }
      })

      const count = await prisma.favorite.count({
        where: { postId: postIdInt }
      })

      return NextResponse.json({ favorited: true, count })
    }
  } catch (error) {
    console.error('收藏错误:', error)
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    )
  }
}

// 检查是否已收藏 / 获取当前用户所有收藏
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')

    // 如果没有 postId，返回当前用户的所有收藏列表
    if (!postId) {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: parseInt(session.user.id)
        },
        include: {
          post: {
            include: {
              author: {
                select: { id: true, username: true, name: true, avatar: true }
              },
              category: true,
              tags: true,
              _count: {
                select: { comments: true, likes: true, favorites: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ favorites })
    }

    // 有 postId 时检查是否已收藏
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId: parseInt(session.user.id),
          postId: parseInt(postId)
        }
      }
    })

    const count = await prisma.favorite.count({
      where: { postId: parseInt(postId) }
    })

    return NextResponse.json({ favorited: !!favorite, count })
  } catch (error) {
    console.error('检查收藏状态错误:', error)
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    )
  }
}