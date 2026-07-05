'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Tag {
  id: number
  name: string
  slug: string
  _count: {
    posts: number
  }
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags')
      if (!res.ok) {
        throw new Error('获取标签失败')
      }
      const data = await res.json()
      setTags(data.tags || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '创建标签失败')
      }
      setNewName('')
      setShowForm(false)
      await fetchTags()
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
            文章标签
          </h1>
          <p className="text-lg text-white/60">
            按标签浏览所有文章
          </p>
        </div>

        {/* 创建标签区域 */}
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
                创建标签
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleCreateTag}
              className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">创建新标签</h3>
              {createError && (
                <p className="text-red-400 text-sm mb-3">{createError}</p>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    标签名称
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="输入标签名称"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
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

        {tags.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/50">暂无标签</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="group inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full shadow-sm hover:shadow-md transition-all border border-white/20 hover:border-white/30"
              >
                <span className="text-white group-hover:text-blue-400 transition-colors font-medium">
                  #{tag.name}
                </span>
                <span className="ml-2 text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                  {tag._count.posts}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
