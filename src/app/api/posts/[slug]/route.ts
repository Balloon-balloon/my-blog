import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取单篇文章
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = await prisma.post.findUnique({
      where: { slug: decodeURIComponent(slug) },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true, bio: true }
        },
        category: true,
        tags: true,
        comments: {
          where: { parentId: null },
          include: {
            author: {
              select: { id: true, username: true, name: true, avatar: true }
            },
            replies: {
              include: {
                author: {
                  select: { id: true, username: true, name: true, avatar: true }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { comments: true, likes: true, favorites: true }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    // 增加浏览量
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('获取文章错误:', error)
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    )
  }
}

// 更新文章
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await prisma.post.findUnique({
      where: { slug: decodeURIComponent(slug) }
    })

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    const { title, content, excerpt, categoryId, tagIds, published } = await req.json()

    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        title: title || post.title,
        content: content || post.content,
        excerpt: excerpt || post.excerpt,
        published: published !== undefined ? published : post.published,
        categoryId: categoryId ? parseInt(categoryId) : post.categoryId,
        tags: tagIds ? {
          set: tagIds.map((id: string) => ({ id: parseInt(id) }))
        } : undefined,
      },
      include: {
        author: {
          select: { id: true, username: true, name: true }
        },
        category: true,
        tags: true,
      }
    })

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error('更新文章错误:', error)
    return NextResponse.json(
      { error: '更新文章失败' },
      { status: 500 }
    )
  }
}

// 删除文章
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await prisma.post.findUnique({
      where: { slug: decodeURIComponent(slug) }
    })

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    await prisma.post.delete({
      where: { id: post.id }
    })

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除文章错误:', error)
    return NextResponse.json(
      { error: '删除文章失败' },
      { status: 500 }
    )
  }
}