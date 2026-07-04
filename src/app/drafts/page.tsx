'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Draft {
  id: number
  title: string
  slug: string
  excerpt: string
  createdAt: string
  updatedAt: string
  category: {
    id: number
    name: string
    slug: string
  } | null
  tags: {
    id: number
    name: string
    slug: string
  }[]
}

export default function DraftsPage() {
  const router = useRouter()

  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/posts?drafts=true')
      if (!res.ok) {
        throw new Error('获取草稿失败')
      }
      const data = await res.json()
      setDrafts(data.posts || [])
    } catch (error) {
      console.error('获取草稿失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/70">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-4">
            草稿箱
          </h1>
          <p className="text-lg text-white/70">
            共 {drafts.length} 篇草稿
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {drafts.map((draft) => (
            <Link
              key={draft.id}
              href={`/posts/${draft.slug}/edit`}
              className="block group"
            >
              <article className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] h-full">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {draft.category && (
                      <span className="text-xs font-medium text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full mr-2">
                        {draft.category.name}
                      </span>
                    )}
                    <span className="text-xs text-white/60">
                      {format(new Date(draft.createdAt), 'yyyy年MM月dd日', {
                        locale: zhCN,
                      })}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
                    {draft.title || '无标题'}
                  </h2>

                  <p className="text-white/70 text-sm mb-4 line-clamp-3">
                    {draft.excerpt || '暂无摘要'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>
                      更新于{' '}
                      {format(new Date(draft.updatedAt), 'MM月dd日 HH:mm', {
                        locale: zhCN,
                      })}
                    </span>
                    <span className="text-blue-300 group-hover:text-blue-200 transition-colors">
                      编辑 &rarr;
                    </span>
                  </div>

                  {draft.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {draft.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>

        {drafts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg mb-4">还没有草稿，去写一篇吧</p>
            <Link
              href="/posts/new"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg"
            >
              写新文章
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
