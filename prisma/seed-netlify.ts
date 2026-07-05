import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 创建分类
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: { name: '技术', slug: 'technology', description: '编程、开发、技术分享' }
    }),
    prisma.category.upsert({
      where: { slug: 'life' },
      update: {},
      create: { name: '生活', slug: 'life', description: '日常、随笔、生活感悟' }
    }),
    prisma.category.upsert({
      where: { slug: 'reading' },
      update: {},
      create: { name: '阅读', slug: 'reading', description: '读书、文章、阅读笔记' }
    }),
    prisma.category.upsert({
      where: { slug: 'anime' },
      update: {},
      create: { name: '二次元', slug: 'anime', description: '动漫、游戏、ACG文化' }
    }),
  ])

  // 创建标签
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'nextjs' }, update: {}, create: { name: 'Next.js', slug: 'nextjs' } }),
    prisma.tag.upsert({ where: { slug: 'react' }, update: {}, create: { name: 'React', slug: 'react' } }),
    prisma.tag.upsert({ where: { slug: 'prisma' }, update: {}, create: { name: 'Prisma', slug: 'prisma' } }),
    prisma.tag.upsert({ where: { slug: 'typescript' }, update: {}, create: { name: 'TypeScript', slug: 'typescript' } }),
    prisma.tag.upsert({ where: { slug: 'daily' }, update: {}, create: { name: '日常', slug: 'daily' } }),
    prisma.tag.upsert({ where: { slug: 'thoughts' }, update: {}, create: { name: '随笔', slug: 'thoughts' } }),
    prisma.tag.upsert({ where: { slug: 'anime' }, update: {}, create: { name: '动漫', slug: 'anime' } }),
    prisma.tag.upsert({ where: { slug: 'travel' }, update: {}, create: { name: '旅行', slug: 'travel' } }),
  ])

  // 创建示例文章
  const posts = await Promise.all([
    prisma.post.upsert({
      where: { slug: 'welcome-to-my-blog' },
      update: {},
      create: {
        title: '欢迎来到我的博客',
        slug: 'welcome-to-my-blog',
        content: '这是我的第一篇博客文章！在这里，我会分享关于技术、生活、阅读和各种有趣的话题。希望大家喜欢！',
        excerpt: '欢迎来到我的博客，这里会分享技术、生活和阅读的内容。',
        published: true,
        viewCount: 128,
        categoryId: categories[1].id,
        tags: { connect: [{ id: tags[4].id }, { id: tags[5].id }] }
      }
    }),
    prisma.post.upsert({
      where: { slug: 'nextjs-blog-tutorial' },
      update: {},
      create: {
        title: '用 Next.js 搭建个人博客',
        slug: 'nextjs-blog-tutorial',
        content: 'Next.js 是一个非常强大的 React 框架，它提供了服务端渲染、静态生成、API 路由等众多功能。本文将介绍如何用 Next.js 搭建一个功能完善的个人博客。',
        excerpt: '介绍如何使用 Next.js 搭建功能完善的个人博客。',
        published: true,
        viewCount: 256,
        categoryId: categories[0].id,
        tags: { connect: [{ id: tags[0].id }, { id: tags[1].id }, { id: tags[2].id }] }
      }
    }),
    prisma.post.upsert({
      where: { slug: 'my-anime-recommendations' },
      update: {},
      create: {
        title: '我最喜欢的动漫推荐',
        slug: 'my-anime-recommendations',
        content: '作为一个二次元爱好者，我想推荐一些我个人认为非常优秀的动漫作品。包括《进击的巨人》、《鬼灭之刃》、《咒术回战》等。',
        excerpt: '推荐一些优秀的动漫作品，包括进击的巨人、鬼灭之刃等。',
        published: true,
        viewCount: 512,
        categoryId: categories[3].id,
        tags: { connect: [{ id: tags[6].id }] }
      }
    }),
  ])

  console.log('Created categories:', categories.map(c => c.name).join(', '))
  console.log('Created tags:', tags.map(t => t.name).join(', '))
  console.log('Created posts:', posts.map(p => p.title).join(', '))
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
