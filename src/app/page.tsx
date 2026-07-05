'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import TypewriterText from '@/components/TypewriterText'
import AnimeQuote from '@/components/AnimeQuote'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  published: boolean
  viewCount: number
  createdAt: string
  author: {
    id: number
    username: string
    name: string
    avatar: string | null
  } | null
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
  _count: {
    comments: number
    likes: number
    favorites: number
  }
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('获取文章失败:', error)
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
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          {/* 日期显示 */}
          <div className="relative mb-4">
            <p className="text-2xl md:text-3xl font-serif text-amber-200/80 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] tracking-wider">
              {format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
            </p>
            <div className="mt-2 mx-auto w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"></div>
          </div>
          <h1 className="relative text-5xl md:text-6xl font-bold text-white drop-shadow-[0_0_30px_rgba(100,149,237,0.5)] mb-6">
            <TypewriterText text="欢迎来到我的二次元博客" speed={80} delay={300} />
          </h1>
          <p className="relative text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            记录学习、分享技术、交流思想
            <br />
            <span className="text-white/50 text-base">在这里，每一篇文章都是一次探索</span>
          </p>
          <div className="relative mt-8 flex justify-center gap-4">
            <Link
              href="/posts/new"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              开始写作
            </Link>
            <Link
              href="/posts"
              className="px-8 py-3 border border-white/30 text-white/90 rounded-full font-medium hover:bg-white/10 transition-all"
            >
              浏览文章
            </Link>
          </div>
        </div>

        {/* 动漫语录 */}
        <div className="mb-12">
          <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="flex items-center justify-center pt-4">
              <span className="text-2xl mr-2">💭</span>
              <span className="text-white/60 text-sm">每日一言</span>
            </div>
            <AnimeQuote />
          </div>
        </div>

        {/* Posts Grid - 报纸质感 */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="block group">
              <article className="newspaper-card rounded-lg overflow-hidden transition-all duration-300 h-full">
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    {post.category && (
                      <span
                        className="newspaper-category text-xs px-2 py-0.5 rounded mr-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {post.category.name}
                      </span>
                    )}
                    <span className="newspaper-meta">
                      {format(new Date(post.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}
                    </span>
                  </div>

                  <h2 className="newspaper-title text-xl mb-3 group-hover:text-amber-800 transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  <div className="newspaper-divider mb-3"></div>

                  <p className="newspaper-text text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between newspaper-meta">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-amber-700/20 flex items-center justify-center text-xs text-amber-800">
                        {post.author?.name?.[0] || post.author?.username?.[0] || '?'}
                      </div>
                      <span>{post.author?.name || post.author?.username || '匿名'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.viewCount}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {post._count.likes}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post._count.comments}
                      </span>
                    </div>
                  </div>

                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="newspaper-tag px-2 py-0.5 rounded"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-white/60 text-lg mb-2">还没有文章</p>
            <p className="text-white/40 text-sm mb-6">成为第一个在这里留下文字的人吧</p>
            <Link
              href="/posts/new"
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              写第一篇文章
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}