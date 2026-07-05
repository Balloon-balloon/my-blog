'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Favorite {
  id: number
  createdAt: string
  post: {
    id: number
    title: string
    slug: string
    excerpt: string
    viewCount: number
    createdAt: string
    author: {
      id: number
      username: string
      name: string | null
      avatar: string | null
    }
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
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/favorites')
      if (!res.ok) {
        throw new Error('获取收藏失败')
      }
      const data = await res.json()
      setFavorites(data.favorites || [])
    } catch (error) {
      console.error('获取收藏失败:', error)
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
            我的收藏
          </h1>
          <p className="text-lg text-white/70">
            共 {favorites.length} 篇收藏
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <Link
              key={favorite.id}
              href={`/posts/${favorite.post.slug}`}
              className="block group"
            >
              <article className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] h-full">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {favorite.post.category && (
                      <span className="text-xs font-medium text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full mr-2">
                        {favorite.post.category.name}
                      </span>
                    )}
                    <span className="text-xs text-white/60">
                      {format(new Date(favorite.post.createdAt), 'yyyy年MM月dd日', {
                        locale: zhCN,
                      })}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
                    {favorite.post.title}
                  </h2>

                  <p className="text-white/70 text-sm mb-4 line-clamp-3">
                    {favorite.post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      {favorite.post.author?.avatar ? (
                        <img
                          src={favorite.post.author.avatar}
                          alt={favorite.post.author?.name || favorite.post.author?.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                          {(favorite.post.author?.name || favorite.post.author?.username || '?')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      <span>{favorite.post.author?.name || favorite.post.author?.username || '匿名'}</span>
                    </div>
                    <span>
                      收藏于{' '}
                      {format(new Date(favorite.createdAt), 'MM月dd日', {
                        locale: zhCN,
                      })}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {favorite.post.viewCount}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {favorite.post._count.likes}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {favorite.post._count.comments}
                    </span>
                  </div>

                  {favorite.post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {favorite.post.tags.map((tag) => (
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

        {favorites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg mb-4">还没有收藏任何文章</p>
            <Link
              href="/posts"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg"
            >
              去发现好文章
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
