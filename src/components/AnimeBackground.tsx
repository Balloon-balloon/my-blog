'use client'

import { useState, useEffect, useCallback } from 'react'

// 使用多个可靠的二次元/动漫风格图片源 (Unsplash)
const ANIME_IMAGES = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=80',
  'https://images.unsplash.com/photo-1541562232579-512a21360020?w=1920&q=80',
  'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=1920&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5a0b81f22?w=1920&q=80',
  'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=1920&q=80',
  'https://images.unsplash.com/photo-1560972550-aba3456b5564?w=1920&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80',
  'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=1920&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80',
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1920&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1920&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1920&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80',
  'https://images.unsplash.com/photo-1518065896235-a4c93e088e7a?w=1920&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80',
  'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&q=80',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1920&q=80',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
  'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=1920&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=1920&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80',
  'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=1920&q=80',
]

export default function AnimeBackground() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const getRandomIndex = useCallback((exclude: number) => {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * ANIME_IMAGES.length)
    } while (newIndex === exclude)
    return newIndex
  }, [])

  const switchImage = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    const newIndex = getRandomIndex(currentIndex)
    setNextIndex(newIndex)

    setTimeout(() => {
      setCurrentIndex(newIndex)
      setNextIndex(null)
      setIsTransitioning(false)
    }, 1200)
  }, [currentIndex, isTransitioning, getRandomIndex])

  useEffect(() => {
    // 随机选择初始图片
    setCurrentIndex(Math.floor(Math.random() * ANIME_IMAGES.length))
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    const interval = setInterval(() => {
      switchImage()
    }, 30000)
    return () => clearInterval(interval)
  }, [loaded, switchImage])

  return (
    <div className="anime-bg-container">
      {/* 当前背景图 */}
      <img
        src={ANIME_IMAGES[currentIndex]}
        alt=""
        className="anime-bg-image"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1.2s ease-in-out',
        }}
      />

      {/* 下一张背景图（过渡用） */}
      {nextIndex !== null && (
        <img
          src={ANIME_IMAGES[nextIndex]}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 2,
            opacity: 1,
            transition: 'opacity 1.2s ease-in-out',
          }}
        />
      )}

      {/* 暗色遮罩 */}
      <div className="anime-bg-overlay" />

      {!loaded && (
        <div className="anime-bg-loading">
          <div className="anime-bg-spinner" />
          <p className="text-white/60 text-sm mt-2">正在加载二次元世界...</p>
        </div>
      )}

      {loaded && (
        <button
          onClick={switchImage}
          disabled={isTransitioning}
          className="anime-bg-switch-btn"
          title="切换背景"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}

      <SakuraEffect />
    </div>
  )
}

function SakuraEffect() {
  const [petals, setPetals] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([])

  useEffect(() => {
    const newPetals = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 8,
      size: 8 + Math.random() * 12,
    }))
    setPetals(newPetals)
  }, [])

  return (
    <div className="sakura-container">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="sakura-petal"
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
          }}
        />
      ))}
    </div>
  )
}
