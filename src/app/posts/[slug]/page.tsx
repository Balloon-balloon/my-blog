'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Link from 'next/link'
import AIChatWidget from '@/components/AIChatWidget'
import { PostAIPanel } from '@/components/PostAIPanel'

interface Author {
  id: number
  username: string
  name: string | null
  avatar: string | null
}

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

interface Reply {
  id: number
  content: string
  createdAt: string
  author: Author
}

interface Comment {
  id: number
  content: string
  createdAt: string
  author: Author
  replies: Reply[]
}

interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  published: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  author: Author
  category: Category | null
  tags: Tag[]
  comments: Comment[]
  _count: {
    comments: number
    likes: number
    favorites: number
  }
}

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)

  const [favoriteCount, setFavoriteCount] = useState(0)
  const [favoriting, setFavoriting] = useState(false)

  const [commentContent, setCommentContent] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [submittingComment, setSubmittingComment] = useState(false)

  // 访客评论信息
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [showGuestForm, setShowGuestForm] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetchPost()
  }, [slug])

  useEffect(() => {
    if (post) {
      fetchLikeCount()
      fetchFavoriteCount()
    }
  }, [post])

  const fetchLikeCount = async () => {
    if (!post) return
    try {
      const res = await fetch(`/api/likes?postId=${post.id}&countOnly=true`)
      if (res.ok) {
        const data = await res.json()
        setLikeCount(data.count)
      }
    } catch (error) {
      console.error('获取点赞数失败:', error)
    }
  }

  const fetchFavoriteCount = async () => {
    if (!post) return
    try {
      const res = await fetch(`/api/favorites?postId=${post.id}&countOnly=true`)
      if (res.ok) {
        const data = await res.json()
        setFavoriteCount(data.count)
      }
    } catch (error) {
      console.error('获取收藏数失败:', error)
    }
  }

  const fetchPost = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/posts/${slug}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '获取文章失败')
      }
      const data = await res.json()
      setPost(data.post)
      setLikeCount(data.post._count.likes)
      setFavoriteCount(data.post._count.favorites)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!post || liking) return
    try {
      setLiking(true)
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setLikeCount(data.count)
      }
    } catch (error) {
      console.error('点赞失败:', error)
    } finally {
      setLiking(false)
    }
  }

  const handleFavorite = async () => {
    if (!post || favoriting) return
    try {
      setFavoriting(true)
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setFavoriteCount(data.count)
      }
    } catch (error) {
      console.error('收藏失败:', error)
    } finally {
      setFavoriting(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post || !commentContent.trim() || submittingComment) return

    // 未填写访客信息
    if (!guestName.trim() || !guestEmail.trim()) {
      setShowGuestForm(true)
      return
    }

    try {
      setSubmittingComment(true)
      const body: any = {
        postId: post.id,
        content: commentContent.trim(),
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
      }

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setCommentContent('')
        await fetchPost()
      } else {
        const data = await res.json()
        alert(data.error || '发表评论失败')
      }
    } catch (error) {
      console.error('发表评论失败:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault()
    if (!post || !replyContent.trim() || submittingComment) return
    if (!guestName.trim() || !guestEmail.trim()) {
      setShowGuestForm(true)
      setReplyingTo(null)
      return
    }
    try {
      setSubmittingComment(true)
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          content: replyContent.trim(),
          parentId,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
        }),
      })
      if (res.ok) {
        setReplyContent('')
        setReplyingTo(null)
        await fetchPost()
      } else {
        const data = await res.json()
        alert(data.error || '发表回复失败')
      }
    } catch (error) {
      console.error('发表回复失败:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('确定要删除这条评论吗？')) return
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await fetchPost()
      }
    } catch (error) {
      console.error('删除评论失败:', error)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/posts/${slug}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.push('/')
      } else {
        const data = await res.json()
        alert(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除文章失败:', error)
      alert('删除文章失败')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">加载中...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-300">{error || '文章不存在'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className={`mx-auto px-4 flex gap-6 ${showAIPanel ? 'max-w-[1400px]' : 'max-w-4xl'}`}>
        {/* 文章头部 */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-2">
              {post.author?.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author?.name || post.author?.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                  {(post.author?.name || post.author?.username || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium text-white/90">
                {post.author?.name || post.author?.username || '匿名'}
              </span>
            </div>
            <span className="text-white/40">|</span>
            <time>
              {format(new Date(post.createdAt), 'yyyy年MM月dd日 HH:mm', {
                locale: zhCN,
              })}
            </time>
            <span className="text-white/40">|</span>
            <span>浏览 {post.viewCount}</span>
          </div>
        </header>

        {/* 分类和标签 */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {post.category && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-sm hover:bg-blue-500/50 transition-colors border border-blue-400/30"
            >
              {post.category.name}
            </Link>
          )}
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm hover:bg-white/20 transition-colors border border-white/20"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        {/* 文章内容 */}
        <article className="prose prose-invert prose-lg max-w-none mb-10 text-white/90">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>

        {/* 操作按钮 */}
        <div className="flex flex-wrap items-center gap-4 mb-10 pb-8 border-b border-white/20">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm ${
              'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
            }`}
          >
            <svg
              className="w-5 h-5"
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
            <span>
              点赞 {likeCount > 0 && `(${likeCount})`}
            </span>
          </button>

          <button
            onClick={handleFavorite}
            disabled={favoriting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm ${
              'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <span>
              收藏 {favoriteCount > 0 && `(${favoriteCount})`}
            </span>
          </button>

          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm ${
              showAIPanel
                ? 'bg-purple-500/30 text-purple-200 border border-purple-400/30'
                : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 00-.659 1.59v1.19a2.25 2.25 0 01-2.25 2.25h-3.24a2.25 2.25 0 01-2.25-2.25v-1.19a2.25 2.25 0 00-.659-1.59L5 14.5m14 0H5"
              />
            </svg>
            <span>AI 助手</span>
          </button>

          <Link
            href={`/posts/${post.slug}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 text-blue-200 rounded-lg hover:bg-blue-500/50 transition-colors border border-blue-400/30 backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>编辑</span>
          </Link>
          <button
            onClick={handleDeletePost}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/30 text-red-300 rounded-lg hover:bg-red-500/50 transition-colors border border-red-400/30 backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>{deleting ? '删除中...' : '删除'}</span>
          </button>
        </div>

        {/* 评论区域 */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-6">
            评论 ({post._count.comments})
          </h2>

          {/* 发表评论 */}
          <form onSubmit={handleSubmitComment} className="mb-8">
            {/* 访客信息输入 */}
            {showGuestForm && (
              <div className="mb-4 p-4 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm space-y-3">
                <p className="text-white/70 text-sm">填写以下信息即可发表评论（无需注册）</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="你的昵称"
                    required
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="你的邮箱"
                    required
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                </div>
              </div>
            )}

            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="写下你的评论（无需登录即可评论）..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none backdrop-blur-sm"
            />
            <div className="mt-2 flex justify-between items-center">
              {!showGuestForm && (
                <span className="text-white/50 text-sm">请填写昵称和邮箱后即可评论</span>
              )}
              <div className="flex-1"></div>
              <button
                type="submit"
                disabled={!commentContent.trim() || submittingComment}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg anime-btn"
              >
                {submittingComment ? '提交中...' : '发表评论'}
              </button>
            </div>
          </form>

          {/* 评论列表 */}
          <div className="space-y-6">
            {post.comments.length === 0 ? (
              <p className="text-white/50 text-center py-8">
                暂无评论，来发表第一条评论吧
              </p>
            ) : (
              post.comments.map((comment) => {
                // 判断是否是访客评论
                const isGuestComment = !comment.author
                const displayName = isGuestComment
                  ? (comment as any).guestName || '访客'
                  : (comment.author.name || comment.author.username)
                const displayAvatar = isGuestComment
                  ? (comment as any).guestAvatar
                  : comment.author.avatar

                return (
                <div
                  key={comment.id}
                  className="border-b border-white/10 pb-6"
                >
                  <div className="flex items-start gap-3">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">
                          {displayName}
                        </span>
                        {isGuestComment && (
                          <span className="text-xs px-2 py-0.5 bg-pink-500/30 text-pink-300 rounded-full border border-pink-400/30">
                            访客
                          </span>
                        )}
                        <time className="text-xs text-white/50">
                          {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm', {
                            locale: zhCN,
                          })}
                        </time>
                      </div>
                      <p className="text-white/80 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          onClick={() =>
                            setReplyingTo(replyingTo === comment.id ? null : comment.id)
                          }
                          className="text-sm text-blue-300 hover:text-blue-200 hover:underline"
                        >
                          {replyingTo === comment.id ? '取消回复' : '回复'}
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-sm text-red-300 hover:text-red-200 hover:underline"
                        >
                          删除
                        </button>
                      </div>

                      {/* 回复表单 */}
                      {replyingTo === comment.id && (
                        <form
                          onSubmit={(e) => handleSubmitReply(e, comment.id)}
                          className="mt-3"
                        >
                          {(!guestName.trim() || !guestEmail.trim()) && (
                            <div className="mb-3 p-3 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm space-y-2">
                              <p className="text-white/70 text-xs">填写昵称和邮箱后即可回复</p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={guestName}
                                  onChange={(e) => setGuestName(e.target.value)}
                                  placeholder="你的昵称"
                                  required
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
                                />
                                <input
                                  type="email"
                                  value={guestEmail}
                                  onChange={(e) => setGuestEmail(e.target.value)}
                                  placeholder="你的邮箱"
                                  required
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
                                />
                              </div>
                            </div>
                          )}
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`回复 ${comment.author.name || comment.author.username}...`}
                            rows={3}
                            autoFocus
                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-sm backdrop-blur-sm"
                          />
                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyContent('')
                              }}
                              className="px-4 py-1.5 text-sm text-white/60 hover:text-white/90 transition-colors"
                            >
                              取消
                            </button>
                            <button
                              type="submit"
                              disabled={!replyContent.trim() || submittingComment}
                              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {submittingComment ? '提交中...' : '回复'}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* 回复列表 */}
                      {comment.replies.length > 0 && (
                        <div className="mt-4 space-y-3 pl-4 border-l-2 border-white/20">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-2">
                              {reply.author.avatar ? (
                                <img
                                  src={reply.author.avatar}
                                  alt={reply.author.name || reply.author.username}
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {(reply.author.name || reply.author.username)
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-medium text-sm text-white">
                                    {reply.author.name || reply.author.username}
                                  </span>
                                  <time className="text-xs text-white/50">
                                    {format(new Date(reply.createdAt), 'yyyy-MM-dd HH:mm', {
                                      locale: zhCN,
                                    })}
                                  </time>
                                </div>
                                <p className="text-sm text-white/80 whitespace-pre-wrap">
                                  {reply.content}
                                </p>
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="mt-1 text-xs text-red-300 hover:text-red-200 hover:underline"
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
              })
            )}
          </div>
        </section>
      </div>

      {/* AI 侧边面板 */}
      {showAIPanel && (
        <div
          className="w-[400px] flex-shrink-0 hidden lg:block"
          style={{
            position: 'sticky',
            top: '80px',
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 100px)',
          }}
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(15, 15, 35, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 105, 180, 0.25)',
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
                borderBottom: '1px solid rgba(255, 105, 180, 0.15)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🤖</span>
                <span className="text-white font-bold text-sm">AI 助手</span>
                <span className="text-[10px] text-white/40">- 基于本文内容</span>
              </div>
              <button
                onClick={() => setShowAIPanel(false)}
                className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PostAIPanel context={`标题：${post.title}\n\n${post.content.substring(0, 2000)}`} />
          </div>
        </div>
      )}
    </div>
  )
}
