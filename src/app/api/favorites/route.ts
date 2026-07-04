import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 收藏/取消收藏
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

    // 检查是否已收藏
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        postId: postIdInt,
        guestIp: ip,
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
          guestIp: ip,
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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown'

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')

    // 如果没有 postId，返回当前用户（IP）的所有收藏列表
    if (!postId) {
      const favorites = await prisma.favorite.findMany({
        where: {
          guestIp: ip
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
    const favorite = await prisma.favorite.findFirst({
      where: {
        postId: parseInt(postId),
        guestIp: ip,
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
