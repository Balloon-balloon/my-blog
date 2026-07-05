'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
}

interface AIChatWidgetProps {
  context?: string  // 当前文章标题+内容，用于快捷提问
}

const quickQuestions = [
  { label: '帮我写摘要', message: '帮我写摘要', icon: '📝' },
  { label: '帮我改标题', message: '帮我改标题', icon: '✏️' },
  { label: '推荐相关话题', message: '推荐相关话题', icon: '💡' },
]

export default function AIChatWidget({ context }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: '你好呀~ 我是 AI 小助手！有什么我可以帮你的吗？你可以点下方的快捷按钮，或者直接输入问题~',
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
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* 聊天面板 */}
      <div
        className={`absolute bottom-16 right-0 w-[360px] max-h-[520px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
        style={{
          background: 'rgba(15, 15, 35, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 105, 180, 0.3)',
        }}
      >
        {/* 面板头部 */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)',
            borderBottom: '1px solid rgba(255, 105, 180, 0.2)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span className="text-white font-bold text-sm">AI 小助手</span>
            <span className="text-xs px-1.5 py-0.5 bg-green-500/30 text-green-300 rounded-full border border-green-400/30">
              在线
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 消息列表 */}
        <div className="h-[320px] overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'text-white rounded-br-md'
                    : 'rounded-bl-md'
                }`}
                style={
                  msg.role === 'user'
                    ? {
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.6) 0%, rgba(99, 102, 241, 0.6) 100%)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                      }
                    : {
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        color: 'rgba(255, 255, 255, 0.9)',
                      }
                }
              >
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">🤖</span>
                    <span className="text-[10px] text-purple-300/70 font-medium">AI 助手</span>
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div
                className="px-3.5 py-2.5 rounded-2xl rounded-bl-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                }}
              >
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 快捷提问 */}
        <div className="px-4 pb-2">
          <div className="flex gap-1.5 flex-wrap">
            {quickQuestions.map((q) => (
              <button
                key={q.message}
                onClick={() => sendMessage(q.message)}
                disabled={loading}
                className="text-xs px-2.5 py-1.5 rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(255, 105, 180, 0.15)',
                  border: '1px solid rgba(255, 105, 180, 0.3)',
                  color: 'rgba(255, 183, 197, 0.9)',
                }}
              >
                {q.icon} {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* 输入框 */}
        <form onSubmit={handleSubmit} className="p-3 pt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题..."
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
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

      {/* 浮窗按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${
          isOpen ? 'rotate-0' : 'hover:rotate-12'
        }`}
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(168, 85, 247, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255, 105, 180, 0.6) 0%, rgba(168, 85, 247, 0.6) 100%)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 105, 180, 0.5)',
          boxShadow: '0 4px 20px rgba(255, 105, 180, 0.4)',
        }}
      >
        <span className="text-2xl">{isOpen ? '✕' : '🤖'}</span>
        {/* 呼吸动画光圈 */}
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.6) 0%, rgba(168, 85, 247, 0.6) 100%)',
            }}
          />
        )}
      </button>
    </div>
  )
}
