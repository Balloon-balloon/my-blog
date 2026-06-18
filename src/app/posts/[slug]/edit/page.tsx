'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

interface Author {
  id: number
  username: string
  name: string | null
}

interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  published: boolean
  authorId: number
  author: Author
  categoryId: number | null
  category: Category | null
  tags: Tag[]
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const slug = params.slug as string

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [published, setPublished] = useState(true)

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  // 未登录用户重定向到登录页
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 获取文章、分类和标签数据
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return

      try {
        setFetching(true)

        // 并行获取文章、分类和标签
        const [postRes, catRes, tagRes] = await Promise.all([
          fetch(`/api/posts/${slug}`),
          fetch('/api/categories'),
          fetch('/api/tags'),
        ])

        // 处理文章数据
        if (postRes.ok) {
          const postData = await postRes.json()
          const fetchedPost: Post = postData.post

          if (!fetchedPost) {
            setNotFound(true)
            setFetching(false)
            return
          }

          setPost(fetchedPost)
          setTitle(fetchedPost.title)
          setExcerpt(fetchedPost.excerpt || '')
          setContent(fetchedPost.content)
          setCategoryId(fetchedPost.categoryId?.toString() || '')
          setSelectedTagIds(fetchedPost.tags.map((t) => t.id))
          setPublished(fetchedPost.published)
        } else if (postRes.status === 404) {
          setNotFound(true)
          setFetching(false)
          return
        } else {
          const data = await postRes.json()
          throw new Error(data.error || '获取文章失败')
        }

        // 处理分类数据
        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData.categories || [])
        }

        // 处理标签数据
        if (tagRes.ok) {
          const tagData = await tagRes.json()
          setTags(tagData.tags || [])
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setFetching(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [slug, status])

  // 检查是否为作者，非作者重定向到首页
  useEffect(() => {
    if (post && session?.user) {
      const currentUserId = parseInt(session.user.id)
      if (post.authorId !== currentUserId) {
        router.push('/')
      }
    }
  }, [post, session, router])

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
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

      const res = await fetch(`/api/posts/${slug}`, {
        method: 'PUT',
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
        throw new Error(data.error || '更新文章失败')
      }

      // 更新成功后跳转到文章详情页
      router.push(`/posts/${data.post.slug}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || fetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">正在跳转到登录页...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">文章不存在</p>
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  // 如果文章数据还没加载完成，显示加载中
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            编辑文章
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href={`/posts/${post.slug}`}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              返回文章
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 标题 */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入文章标题"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            />
          </div>

          {/* 摘要 */}
          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              摘要
            </label>
            <input
              type="text"
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="请输入文章摘要（可选，留空将自动截取内容前200字）"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            />
          </div>

          {/* 内容 */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入文章内容（支持 Markdown 格式）"
              rows={16}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-y transition-colors font-mono text-sm"
            />
          </div>

          {/* 分类选择 */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              分类
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            >
              <option value="">请选择分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                暂无分类，请先创建分类
              </p>
            )}
          </div>

          {/* 标签选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标签
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-2 border-blue-500 dark:border-blue-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            {tags.length === 0 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                暂无标签，请先创建标签
              </p>
            )}
            {selectedTagIds.length > 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                已选择 {selectedTagIds.length} 个标签
              </p>
            )}
          </div>

          {/* 发布状态 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800"
            />
            <label
              htmlFor="published"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              已发布（取消勾选则设为草稿）
            </label>
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? '保存中...' : '保存修改'}
            </button>
            <Link
              href={`/posts/${post.slug}`}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
