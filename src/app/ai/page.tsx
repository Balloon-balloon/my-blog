'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
}

const quickQuestions = [
  { label: '帮我写摘要', message: '帮我写摘要', icon: '📝', desc: '基于文章内容生成摘要' },
  { label: '帮我改标题', message: '帮我改标题', icon: '✏️', desc: '推荐更有吸引力的标题' },
  { label: '推荐相关话题', message: '推荐相关话题', icon: '💡', desc: '根据标签推荐话题' },
  { label: '自我介绍', message: '你是谁', icon: '🌸', desc: '了解 AI 助手' },
]

const defaultMessages: Message[] = [
  {
    id: 'welcome',
    role: 'ai',
    content: '你好呀~ 欢迎来到 AI 助手页面！我是你的专属 AI 小助手，可以帮你分析文章、生成摘要、推荐话题等。试着和我聊天吧~',
  },
]

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>(defaultMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: data.reply,
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: '抱歉，请求出错了，请稍后再试~',
        }
        setMessages((prev) => [...prev, aiMsg])
      }
    } catch {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '网络似乎不太好，请检查网络后重试~',
      }
      setMessages((prev) => [...prev, aiMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearMessages = () => {
    if (confirm('确定要清空对话历史吗？')) {
      setMessages(defaultMessages)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-3 anime-glow-text">
            AI 智能助手
          </h1>
          <p className="text-white/60 text-sm">
            和 AI 聊天，获取灵感和帮助
          </p>
          {/* 装饰元素 */}
          <div className="flex justify-center gap-3 mt-4">
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0ms' }}>✨</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '100ms' }}>🌟</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '200ms' }}>💫</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '300ms' }}>⭐</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '400ms' }}>✨</span>
          </div>
        </div>

        {/* 聊天区域 */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(15, 15, 35, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 105, 180, 0.2)',
          }}
        >
          {/* 聊天头部 */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
              borderBottom: '1px solid rgba(255, 105, 180, 0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.4) 0%, rgba(168, 85, 247, 0.4) 100%)',
                  border: '1px solid rgba(255, 105, 180, 0.3)',
                }}
              >
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <div className="text-white font-bold text-sm">AI 小助手</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-300/70">在线 - 随时为你服务</span>
                </div>
              </div>
            </div>
            <button
              onClick={clearMessages}
              className="px-3 py-1.5 text-xs rounded-lg transition-all hover:scale-105 text-white/60 hover:text-white hover:bg-white/10"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              清空对话
            </button>
          </div>

          {/* 消息区域 */}
          <div className="h-[450px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                    }}
                  >
                    <span className="text-sm">🤖</span>
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-md'
                      : 'rounded-bl-md'
                  }`}
                  style={
                    msg.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(99, 102, 241, 0.5) 100%)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                        }
                      : {
                          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
                          border: '1px solid rgba(168, 85, 247, 0.2)',
                          color: 'rgba(255, 255, 255, 0.9)',
                        }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                  }}
                >
                  <span className="text-sm">🤖</span>
                </div>
                <div
                  className="px-4 py-3 rounded-2xl rounded-bl-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 快捷提问区域 */}
          <div className="px-6 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q.message}
                  onClick={() => sendMessage(q.message)}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group"
                  style={{
                    background: 'rgba(255, 105, 180, 0.08)',
                    border: '1px solid rgba(255, 105, 180, 0.2)',
                  }}
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">{q.icon}</span>
                  <div>
                    <div className="text-xs text-white/80 font-medium">{q.label}</div>
                    <div className="text-[10px] text-white/40">{q.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 输入区域 */}
          <form
            onSubmit={handleSubmit}
            className="p-4 pt-3"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入你想问的问题..."
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-5 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 anime-btn"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.5) 0%, rgba(168, 85, 247, 0.5) 100%)',
                  border: '1px solid rgba(255, 105, 180, 0.3)',
                  color: 'white',
                }}
              >
                发送
              </button>
            </div>
          </form>
        </div>

        {/* 底部装饰 */}
        <div className="text-center mt-8 text-white/30 text-xs">
          <p>Powered by AI | 博客智能助手</p>
        </div>
      </div>
    </div>
  )
}
