'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Category {
  id: number
  name: string
  slug: string
}

interface Tag {
  id: number
  name: string
  slug: string
}

export default function NewPostPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [published, setPublished] = useState(true)

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  // 创建分类/标签的弹窗状态
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [creatingTag, setCreatingTag] = useState(false)

  // 未登录用户重定向到登录页
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 获取分类和标签数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true)
        const [catRes, tagRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
        ])

        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData.categories || [])
        }

        if (tagRes.ok) {
          const tagData = await tagRes.json()
          setTags(tagData.tags || [])
        }
      } catch (err) {
        console.error('获取数据失败:', err)
      } finally {
        setFetching(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setCreatingCategory(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDesc.trim() || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCategories([...categories, data.category])
        setCategoryId(String(data.category.id))
        setNewCategoryName('')
        setNewCategoryDesc('')
        setShowCategoryModal(false)
      } else {
        const err = await res.json()
        alert(err.error || '创建分类失败')
      }
    } catch (err) {
      alert('创建分类失败')
    } finally {
      setCreatingCategory(false)
    }
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    setCreatingTag(true)
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setTags([...tags, data.tag])
        setSelectedTagIds([...selectedTagIds, data.tag.id])
        setNewTagName('')
        setShowTagModal(false)
      } else {
        const err = await res.json()
        alert(err.error || '创建标签失败')
      }
    } catch (err) {
      alert('创建标签失败')
    } finally {
      setCreatingTag(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空')
      return
    }

    try {
      setLoading(true)
      setError('')

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim() || undefined,
          content: content.trim(),
          categoryId: categoryId || undefined,
          tagIds: selectedTagIds.map(String),
          published,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '创建文章失败')
      }

      router.push(`/posts/${data.post.slug}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">正在跳转到登录页...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            新建文章
          </h1>
          <Link
            href="/"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            返回首页
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <label htmlFor="title" className="block text-sm font-medium text-white/90 mb-2">
              标题 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入文章标题"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            />
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <label htmlFor="excerpt" className="block text-sm font-medium text-white/90 mb-2">
              摘要
            </label>
            <input
              type="text"
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="请输入文章摘要（可选，留空将自动截取内容前200字）"
              className="w-full px-4 py-3 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            />
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <label htmlFor="content" className="block text-sm font-medium text-white/90 mb-2">
              内容 <span className="text-red-400">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入文章内容（支持 Markdown 格式）"
              rows={16}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y transition-colors font-mono text-sm"
            />
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="category" className="block text-sm font-medium text-white/90">
                分类
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
              >
                + 新建分类
              </button>
            </div>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            >
              <option value="">不选择分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-1 text-xs text-white/60">
                还没有分类，点击上方"新建分类"创建一个吧
              </p>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white/90">
                标签
              </label>
              <button
                type="button"
                onClick={() => setShowTagModal(true)}
                className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
              >
                + 新建标签
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? 'bg-blue-500/60 text-white border-2 border-blue-400'
                      : 'bg-white/20 text-white/80 border-2 border-transparent hover:bg-white/30'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            {tags.length === 0 && (
              <p className="mt-1 text-xs text-white/60">
                还没有标签，点击上方"新建标签"创建一个吧
              </p>
            )}
            {selectedTagIds.length > 0 && (
              <p className="mt-2 text-xs text-white/60">
                已选择 {selectedTagIds.length} 个标签
              </p>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 text-blue-500 border-white/30 rounded focus:ring-blue-400 bg-white/20"
            />
            <label htmlFor="published" className="ml-2 text-sm text-white/90">
              立即发布（取消勾选则保存为草稿）
            </label>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg"
            >
              {loading ? '创建中...' : '创建文章'}
            </button>
            <Link
              href="/"
              className="px-6 py-3 border border-white/30 text-white/90 rounded-lg hover:bg-white/10 transition-colors"
            >
              取消
            </Link>
          </div>
        </form>
      </div>

      {/* 创建分类弹窗 */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900/90 backdrop-blur-md rounded-xl p-6 w-full max-w-md mx-4 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">新建分类</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm text-white/80 mb-1">分类名称</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="例如：技术、生活、随笔"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">描述（可选）</label>
                <input
                  type="text"
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="分类描述"
                  className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  {creatingCategory ? '创建中...' : '创建'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2 border border-white/30 text-white/90 rounded-lg hover:bg-white/10 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 创建标签弹窗 */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900/90 backdrop-blur-md rounded-xl p-6 w-full max-w-md mx-4 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">新建标签</h3>
            <form onSubmit={handleCreateTag} className="space-y-4">
              <div>
                <label className="block text-sm text-white/80 mb-1">标签名称</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="例如：React、Python、感悟"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creatingTag}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  {creatingTag ? '创建中...' : '创建'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTagModal(false)}
                  className="flex-1 px-4 py-2 border border-white/30 text-white/90 rounded-lg hover:bg-white/10 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}