import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

// 获取所有标签
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('获取标签错误:', error)
    return NextResponse.json(
      { error: '获取标签失败' },
      { status: 500 }
    )
  }
}

// 创建标签
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json()

    if (!name) {
      return NextResponse.json(
        { error: '标签名称不能为空' },
        { status: 400 }
      )
    }

    const slug = slugify(name)
    const existingSlug = await prisma.tag.findUnique({ where: { slug } })
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug

    const tag = await prisma.tag.create({
      data: {
        name,
        slug: finalSlug
      }
    })

    return NextResponse.json({ tag })
  } catch (error) {
    console.error('创建标签错误:', error)
    return NextResponse.json(
      { error: '创建标签失败' },
      { status: 500 }
    )
  }
}