'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const EMOJI_POOL = ['🌸', '🌺', '🎌', '🎋', '🐱', '🦊', '🐼', '🐸', '🎀', '⭐', '🌙', '🔮'] as const

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function initCards(): Card[] {
  const selected = shuffleArray([...EMOJI_POOL]).slice(0, 8)
  const pairs = [...selected, ...selected]
  const shuffled = shuffleArray(pairs)
  return shuffled.map((emoji, index) => ({
    id: index,
    emoji,
    isFlipped: false,
    isMatched: false,
  }))
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function GamePage() {
  const [cards, setCards] = useState<Card[]>(() => initCards())
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [matchedCount, setMatchedCount] = useState(0)
  const [lockBoard, setLockBoard] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [fireworks, setFireworks] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([])
  const [comboCount, setComboCount] = useState(0)
  const [lastMatchTime, setLastMatchTime] = useState(0)

  // Timer
  useEffect(() => {
    if (isPlaying && !isComplete) {
      timerRef.current = setInterval(() => {
        setTime((t) => t + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, isComplete])

  // Check completion
  useEffect(() => {
    if (matchedCount === 8 && matchedCount > 0) {
      setIsComplete(true)
      setIsPlaying(false)
      spawnFireworks()
    }
  }, [matchedCount])

  const spawnFireworks = () => {
    const items: Array<{ id: number; x: number; y: number; emoji: string }> = []
    const celebrationEmojis = ['🎉', '🎊', '✨', '🌸', '⭐', '🎀', '🌙', '🔮', '💎', '🌟']
    for (let i = 0; i < 30; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        emoji: celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)],
      })
    }
    setFireworks(items)
    setTimeout(() => setFireworks([]), 4000)
  }

  const handleCardClick = useCallback(
    (id: number) => {
      if (lockBoard) return
      if (flippedIds.includes(id)) return
      if (cards.find((c) => c.id === id)?.isMatched) return
      if (flippedIds.length === 2) return

      // Start timer on first click
      if (!isPlaying) {
        setIsPlaying(true)
      }

      const newFlipped = [...flippedIds, id]
      setFlippedIds(newFlipped)

      // Flip the card
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
      )

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1)
        const [firstId, secondId] = newFlipped
        const firstCard = cards.find((c) => c.id === firstId)!
        const secondCard = cards.find((c) => c.id === secondId)!

        if (firstCard.emoji === secondCard.emoji) {
          // Match!
          setLockBoard(true)
          const now = Date.now()
          if (now - lastMatchTime < 3000 && lastMatchTime > 0) {
            setComboCount((c) => c + 1)
          } else {
            setComboCount(1)
          }
          setLastMatchTime(now)

          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
              )
            )
            setFlippedIds([])
            setMatchedCount((mc) => mc + 1)
            setLockBoard(false)
          }, 600)
        } else {
          // No match
          setLockBoard(true)
          setComboCount(0)
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
              )
            )
            setFlippedIds([])
            setLockBoard(false)
          }, 800)
        }
      }
    },
    [cards, flippedIds, isPlaying, lockBoard, lastMatchTime]
  )

  const resetGame = () => {
    setCards(initCards())
    setFlippedIds([])
    setMoves(0)
    setTime(0)
    setIsPlaying(false)
    setIsComplete(false)
    setMatchedCount(0)
    setLockBoard(false)
    setComboCount(0)
    setLastMatchTime(0)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const getStarRating = () => {
    if (moves <= 12) return 3
    if (moves <= 18) return 2
    return 1
  }

  const starRating = getStarRating()

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_0_20px_rgba(100,149,237,0.5)] mb-2">
            🎮 记忆翻牌大挑战
          </h1>
          <p className="text-white/50 text-sm">翻开卡牌，找到所有配对吧！</p>
        </div>

        {/* Stats Panel */}
        <div className="flex justify-center items-center gap-4 md:gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 md:px-6 py-3 border border-white/10 text-center min-w-[100px]">
            <div className="text-white/50 text-xs mb-1">⏱️ 用时</div>
            <div className="text-2xl font-bold text-white anime-glow-text">{formatTime(time)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 md:px-6 py-3 border border-white/10 text-center min-w-[100px]">
            <div className="text-white/50 text-xs mb-1">🔄 翻牌</div>
            <div className="text-2xl font-bold text-white anime-glow-text">{moves}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 md:px-6 py-3 border border-white/10 text-center min-w-[100px]">
            <div className="text-white/50 text-xs mb-1">✅ 配对</div>
            <div className="text-2xl font-bold text-white anime-glow-text">
              {matchedCount}<span className="text-white/40 text-lg">/8</span>
            </div>
          </div>
        </div>

        {/* Combo indicator */}
        {comboCount > 1 && (
          <div className="text-center mb-4">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-bold animate-bounce"
              style={{
                background: 'linear-gradient(135deg, rgba(255,105,180,0.4), rgba(138,43,226,0.4))',
                border: '1px solid rgba(255,105,180,0.5)',
                color: '#fff',
                textShadow: '0 0 10px rgba(255,105,180,0.8)',
              }}
            >
              🔥 {comboCount} 连击！
            </span>
          </div>
        )}

        {/* Game Board */}
        <div
          className="grid grid-cols-4 gap-2.5 md:gap-3.5 mx-auto mb-8"
          style={{ maxWidth: '440px' }}
        >
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isFlipped || card.isMatched || lockBoard}
              className="game-card-wrapper"
              aria-label={card.isFlipped || card.isMatched ? card.emoji : '翻牌'}
            >
              <div
                className={`game-card-inner ${
                  card.isFlipped || card.isMatched ? 'is-flipped' : ''
                } ${card.isMatched ? 'is-matched' : ''}`}
              >
                {/* Card Back */}
                <div className="game-card-face game-card-back">
                  <div className="game-card-back-design">
                    <span className="text-2xl md:text-3xl">❓</span>
                  </div>
                </div>
                {/* Card Front */}
                <div className="game-card-face game-card-front">
                  <span className="card-emoji">{card.emoji}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="max-w-[440px] mx-auto mb-6">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(matchedCount / 8) * 100}%`,
                background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
                boxShadow: '0 0 10px rgba(168,85,247,0.5)',
              }}
            />
          </div>
        </div>

        {/* Restart Button */}
        <div className="text-center mb-8">
          <button
            onClick={resetGame}
            className="anime-btn px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.4))',
              border: '1px solid rgba(168,85,247,0.3)',
            }}
          >
            🔄 重新开始
          </button>
        </div>

        {/* Completion Modal */}
        {isComplete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetGame} />
            <div
              className="relative bg-gradient-to-br from-[#1a1a3e] to-[#2d1b4e] rounded-2xl p-8 max-w-sm w-full border border-white/20 shadow-2xl text-center animate-modal-in"
            >
              {/* Glow decoration */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl" />

              <div className="relative">
                <h2 className="text-3xl font-bold text-white mb-2 anime-glow-text">
                  🎉 恭喜通关！
                </h2>
                <p className="text-white/60 text-sm mb-6">你成功找到了所有配对！</p>

                {/* Stars */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3].map((star) => (
                    <span
                      key={star}
                      className={`text-4xl transition-all duration-300 ${
                        star <= starRating ? 'animate-star-pop' : 'opacity-20'
                      }`}
                      style={{ animationDelay: `${star * 200}ms` }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-white/50 text-xs mb-1">用时</div>
                    <div className="text-xl font-bold text-white">{formatTime(time)}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-white/50 text-xs mb-1">翻牌次数</div>
                    <div className="text-xl font-bold text-white">{moves} 次</div>
                  </div>
                </div>

                {/* Rating message */}
                <p className="text-white/50 text-sm mb-6">
                  {starRating === 3 && '🏆 完美！你的记忆力超群！'}
                  {starRating === 2 && '👏 很不错！再接再厉！'}
                  {starRating === 1 && '💪 完成了！试试再快一些吧！'}
                </p>

                <button
                  onClick={resetGame}
                  className="anime-btn w-full px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    boxShadow: '0 0 20px rgba(99,102,241,0.4)',
                  }}
                >
                  🔄 再来一局
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fireworks */}
        {fireworks.length > 0 && (
          <div className="fixed inset-0 z-[101] pointer-events-none overflow-hidden">
            {fireworks.map((fw) => (
              <span
                key={fw.id}
                className="firework-particle"
                style={{
                  left: `${fw.x}%`,
                  top: `${fw.y}%`,
                  fontSize: `${16 + Math.random() * 20}px`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1.5 + Math.random() * 2}s`,
                }}
              >
                {fw.emoji}
              </span>
            ))}
          </div>
        )}

        {/* How to Play */}
        <div className="max-w-md mx-auto mt-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5">
            <h3 className="text-white/80 text-sm font-medium mb-3 text-center">📖 玩法说明</h3>
            <ul className="text-white/40 text-xs space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 shrink-0">1.</span>
                <span>点击卡牌翻开，每次可翻两张</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 shrink-0">2.</span>
                <span>两张图案相同即配对成功，会自动消除</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 shrink-0">3.</span>
                <span>图案不同则自动翻回，记住它们的位置</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 shrink-0">4.</span>
                <span>连续配对成功可触发连击加分效果！</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 shrink-0">5.</span>
                <span>用最少翻牌次数完成可获得更多星星 ⭐</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Inline styles for game-specific animations */}
      <style jsx global>{`
        /* ===== Game Card Styles ===== */
        .game-card-wrapper {
          aspect-ratio: 1;
          perspective: 800px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        .game-card-wrapper:disabled {
          cursor: default;
        }

        .game-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .game-card-inner.is-flipped {
          transform: rotateY(180deg);
        }

        .game-card-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        /* Card Back */
        .game-card-back {
          background: linear-gradient(135deg, #4338ca 0%, #7c3aed 50%, #a855f7 100%);
          border: 2px solid rgba(255, 255, 255, 0.15);
          box-shadow:
            0 4px 12px rgba(99, 102, 241, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .game-card-back::before {
          content: '';
          position: absolute;
          inset: 6px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          pointer-events: none;
        }

        .game-card-back-design {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          position: relative;
        }

        .game-card-back-design::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 60%
          );
          pointer-events: none;
        }

        .game-card-wrapper:not(:disabled):hover .game-card-back {
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow:
            0 6px 20px rgba(99, 102, 241, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .game-card-wrapper:not(:disabled):active .game-card-back {
          transform: scale(0.95);
        }

        /* Card Front */
        .game-card-front {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          border: 2px solid rgba(168, 85, 247, 0.3);
          transform: rotateY(180deg);
          box-shadow:
            0 4px 12px rgba(168, 85, 247, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .card-emoji {
          font-size: 2rem;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        @media (min-width: 768px) {
          .card-emoji {
            font-size: 2.8rem;
          }
        }

        /* Matched card animation */
        .game-card-inner.is-matched {
          animation: matchPulse 0.6s ease-out;
        }

        .game-card-inner.is-matched .game-card-front {
          background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
          border-color: rgba(52, 211, 153, 0.4);
          box-shadow:
            0 0 20px rgba(52, 211, 153, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        @keyframes matchPulse {
          0% { transform: rotateY(180deg) scale(1); }
          30% { transform: rotateY(180deg) scale(1.1); }
          60% { transform: rotateY(180deg) scale(0.95); }
          100% { transform: rotateY(180deg) scale(1); }
        }

        /* Match glow effect */
        .game-card-inner.is-matched::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 16px;
          background: transparent;
          border: 2px solid rgba(52, 211, 153, 0.6);
          animation: matchGlow 1s ease-out forwards;
          z-index: 10;
          pointer-events: none;
        }

        @keyframes matchGlow {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.3);
          }
        }

        /* Firework particles */
        .firework-particle {
          position: absolute;
          animation: fireworkFloat linear forwards;
          pointer-events: none;
        }

        @keyframes fireworkFloat {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0) rotate(0deg);
          }
          20% {
            opacity: 1;
            transform: translateY(-20px) scale(1.2) rotate(45deg);
          }
          60% {
            opacity: 0.8;
            transform: translateY(-40px) scale(1) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-80px) scale(0.5) rotate(360deg);
          }
        }

        /* Modal animation */
        .animate-modal-in {
          animation: modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes modalIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Star pop animation */
        .animate-star-pop {
          animation: starPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }

        @keyframes starPop {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-30deg);
          }
          60% {
            opacity: 1;
            transform: scale(1.3) rotate(10deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        /* Responsive card size for mobile */
        @media (max-width: 480px) {
          .card-emoji {
            font-size: 1.5rem;
          }
          .game-card-face {
            border-radius: 8px;
          }
        }
      `}</style>
    </div>
  )
}
