'use client'

import { useState, useEffect } from 'react'

export default function VisitorCounter() {
  const [count, setCount] = useState(0)
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    // 从 localStorage 读取或初始化访客数
    const stored = localStorage.getItem('visitor_count')
    const storedDate = localStorage.getItem('visitor_date')
    const today = new Date().toDateString()

    let currentCount: number
    if (storedDate !== today) {
      // 新的一天，增加计数
      currentCount = stored ? parseInt(stored) + 1 : 1
      localStorage.setItem('visitor_count', currentCount.toString())
      localStorage.setItem('visitor_date', today)
    } else {
      currentCount = stored ? parseInt(stored) : 1
    }

    setCount(currentCount)
  }, [])

  useEffect(() => {
    if (count === 0) return

    // 数字滚动动画
    const duration = 1500
    const steps = 30
    const increment = count / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), count)
      setDisplayCount(current)
      if (step >= steps) {
        clearInterval(timer)
        setDisplayCount(count)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [count])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 flex items-center space-x-2">
        <span className="text-pink-400 text-lg">👥</span>
        <div className="text-white/80 text-sm">
          <span className="font-mono font-bold text-pink-300">{displayCount.toLocaleString()}</span>
          <span className="text-white/50 ml-1">位访客</span>
        </div>
      </div>
    </div>
  )
}
