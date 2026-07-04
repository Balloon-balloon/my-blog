import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// 创建评论（支持登录用户和访客）
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { content, postId, parentId, guestName, guestEmail } = await req.json()

    if (!content || !postId) {
      return NextResponse.json(
        { error: '内容和文章ID不能为空' },
        { status: 400 }
      )
    }

    let commentData: any = {
      content,
      postId: parseInt(postId),
      parentId: parentId ? parseInt(parentId) : null,
    }

    // 如果是登录用户
    if (session?.user) {
      commentData.authorId = parseInt(session.user.id)
      commentData.isGuest = false
    } else {
      // 访客评论
      if (!guestName || !guestEmail) {
        return NextResponse.json(
          { error: '访客需要提供昵称和邮箱' },
          { status: 400 }
        )
      }
      commentData.isGuest = true
      commentData.guestName = guestName.trim()
      commentData.guestEmail = guestEmail.trim()
      // 生成随机访客头像
      commentData.guestAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(guestEmail)}`
    }

    const comment = await prisma.comment.create({
      data: commentData,
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true }
        }
      }
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('创建评论错误:', error)
    return NextResponse.json(
      { error: '创建评论失败' },
      { status: 500 }
    )
  }
}

// 删除评论
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const commentId = searchParams.get('id')

    if (!commentId) {
      return NextResponse.json(
        { error: '评论ID不能为空' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    })

    if (!comment) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      )
    }

    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    })

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除评论错误:', error)
    return NextResponse.json(
      { error: '删除评论失败' },
      { status: 500 }
    )
  }
}
