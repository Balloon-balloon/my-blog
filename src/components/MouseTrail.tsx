'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -100, y: -100 })
  const lastMouseRef = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = [
      'rgba(255, 182, 193, 0.8)', // pink
      'rgba(135, 206, 250, 0.8)', // light blue
      'rgba(221, 160, 221, 0.8)', // plum
      'rgba(255, 218, 185, 0.8)', // peach
      'rgba(176, 224, 230, 0.8)', // powder blue
    ]

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }

      // 计算鼠标移动距离
      const dx = mouseRef.current.x - lastMouseRef.current.x
      const dy = mouseRef.current.y - lastMouseRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // 只在移动距离足够时生成粒子
      if (distance > 5) {
        const particleCount = Math.min(Math.floor(distance / 5), 3)
        for (let i = 0; i < particleCount; i++) {
          const t = i / particleCount
          particlesRef.current.push({
            x: lastMouseRef.current.x + dx * t,
            y: lastMouseRef.current.y + dy * t,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1,
            maxLife: 30 + Math.random() * 20,
            size: 2 + Math.random() * 3,
            color: colors[Math.floor(Math.random() * colors.length)],
          })
        }
        lastMouseRef.current = { ...mouseRef.current }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter(p => p.life > 0)

      particlesRef.current.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 1 / p.maxLife
        p.vx *= 0.98
        p.vy *= 0.98

        const alpha = p.life
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0, p.size * p.life), 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace('0.8', alpha.toFixed(2))
        ctx.fill()

        // 添加光晕效果
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0, p.size * p.life * 2), 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace('0.8', (alpha * 0.3).toFixed(2))
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
