'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  _count: {
    posts: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) {
        throw new Error('获取分类失败')
      }
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '创建分类失败')
      }
      setNewName('')
      setNewDescription('')
      setShowForm(false)
      await fetchCategories()
    } catch (err: any) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-white/70">加载中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-red-400">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            文章分类
          </h1>
          <p className="text-lg text-white/60">
            按分类浏览所有文章
          </p>
        </div>

        {/* 创建分类区域 */}
        <div className="max-w-lg mx-auto mb-10">
          {!showForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg backdrop-blur-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                创建分类
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleCreateCategory}
              className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">创建新分类</h3>
              {createError && (
                <p className="text-red-400 text-sm mb-3">{createError}</p>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    分类名称
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="输入分类名称"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    分类描述
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="输入分类描述（可选）"
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
                  >
                    {creating ? '创建中...' : '创建'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setCreateError('') }}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/50">暂无分类</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group block bg-white/10 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-white/20 hover:border-white/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h2>
                  <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium text-blue-300 bg-blue-500/20 rounded-full">
                    {category._count.posts} 篇
                  </span>
                </div>
                {category.description && (
                  <p className="text-white/60 text-sm line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="mt-4 flex items-center text-sm text-blue-400 group-hover:underline">
                  <span>查看文章</span>
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
