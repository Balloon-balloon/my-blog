import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

// 获取文章列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const drafts = searchParams.get('drafts')

    const skip = (page - 1) * limit

    const where: any = { published: true }

    // 如果请求草稿，直接返回所有未发布文章
    if (drafts === 'true') {
      where.published = false
    }

    if (category) {
      where.category = { slug: category }
    }

    if (tag) {
      where.tags = { some: { slug: tag } }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: { id: true, username: true, name: true, avatar: true }
          },
          category: true,
          tags: true,
          _count: {
            select: { comments: true, likes: true, favorites: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('获取文章列表错误:', error)
    return NextResponse.json(
      { error: '获取文章列表失败', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

// 创建文章
export async function POST(req: NextRequest) {
  try {
    // 获取客户端 IP 作为访客标识
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown'

    const { title, content, excerpt, categoryId, tagIds, published } = await req.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      )
    }

    const slug = slugify(title)
    const existingSlug = await prisma.post.findUnique({ where: { slug } })
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug

    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt: excerpt || content.slice(0, 200) + '...',
        published: published ?? true,
        authorId: null,
        guestIp: ip,
        categoryId: categoryId ? parseInt(categoryId) : null,
        tags: tagIds ? {
          connect: tagIds.map((id: string) => ({ id: parseInt(id) }))
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

    return NextResponse.json({ post })
  } catch (error) {
    console.error('创建文章错误:', error)
    return NextResponse.json(
      { error: '创建文章失败' },
      { status: 500 }
    )
  }
}