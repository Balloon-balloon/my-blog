'use client'

import { useEffect, useState, useCallback } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  emoji: string
  vx: number
  vy: number
  opacity: number
  scale: number
  rotation: number
}

const EMOJIS = ['✨', '⭐', '🌸', '💫', '🎀', '💖', '🌟', '✨', '🦋', '🌺', '💕', '⭐']

let nextId = 0

export default function ClickEffects() {
  const [particles, setParticles] = useState<Particle[]>([])

  const createParticles = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = Array.from({ length: 6 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 4
      return {
        id: nextId++,
        x,
        y,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        opacity: 1,
        scale: 0.5 + Math.random() * 0.8,
        rotation: Math.random() * 360,
      }
    })

    setParticles(prev => [...prev, ...newParticles])

    // 动画更新
    const animate = () => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15,
            opacity: p.opacity - 0.02,
            rotation: p.rotation + 5,
          }))
          .filter(p => p.opacity > 0)
      )
    }

    const interval = setInterval(animate, 16)
    setTimeout(() => clearInterval(interval), 1000)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      createParticles(e.clientX, e.clientY)
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [createParticles])

  return (
    <div className="click-effects-container">
      {particles.map(p => (
        <div
          key={p.id}
          className="click-particle"
          style={{
            left: p.x,
            top: p.y,
            opacity: p.opacity,
            transform: `translate(-50%, -50%) scale(${p.scale}) rotate(${p.rotation}deg)`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}
