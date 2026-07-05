'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
}

interface PostAIPanelProps {
  context?: string
}

const quickQuestions = [
  { label: '写摘要', message: '帮我写摘要', icon: '📝' },
  { label: '改标题', message: '帮我改标题', icon: '✏️' },
  { label: '推荐话题', message: '推荐相关话题', icon: '💡' },
]

export function PostAIPanel({ context }: PostAIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: '你好呀~ 我已经读取了当前文章的内容，你可以让我帮你写摘要、改标题或者推荐相关话题~',
    },
  ])
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
        body: JSON.stringify({
          message: text.trim(),
          context: context || undefined,
        }),
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

  return (
    <div className="flex flex-col" style={{ height: '500px' }}>
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'text-white rounded-br-sm'
                  : 'rounded-bl-sm'
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
              className="px-3 py-2 rounded-xl rounded-bl-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
              }}
            >
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 快捷提问 */}
      <div className="px-3 pb-2">
        <div className="flex gap-1.5">
          {quickQuestions.map((q) => (
            <button
              key={q.message}
              onClick={() => sendMessage(q.message)}
              disabled={loading}
              className="text-[11px] px-2 py-1 rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(255, 105, 180, 0.12)',
                border: '1px solid rgba(255, 105, 180, 0.25)',
                color: 'rgba(255, 183, 197, 0.85)',
              }}
            >
              {q.icon} {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="p-3 pt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入问题..."
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.4) 0%, rgba(168, 85, 247, 0.4) 100%)',
              border: '1px solid rgba(255, 105, 180, 0.25)',
              color: 'white',
            }}
          >
            发送
          </button>
        </div>
      </form>
    </div>
  )
}
