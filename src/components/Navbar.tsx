'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white hover:text-blue-300 transition-colors drop-shadow-lg">
              👑 10大帝
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-2">
              <Link href="/" className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                首页
              </Link>
              <Link href="/posts" className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                文章
              </Link>
              <Link href="/reading" className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                📚 阅读吧
              </Link>
              <Link href="/categories" className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                分类
              </Link>
              <Link href="/tags" className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                标签
              </Link>
              <Link href="/posts/new" className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                ✍️ 写文章
              </Link>
            </div>
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link href="/" className="block text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all" onClick={() => setIsMenuOpen(false)}>
              首页
            </Link>
            <Link href="/posts" className="block text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all" onClick={() => setIsMenuOpen(false)}>
              文章
            </Link>
            <Link href="/reading" className="block text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all" onClick={() => setIsMenuOpen(false)}>
              📚 阅读吧
            </Link>
            <Link href="/categories" className="block text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all" onClick={() => setIsMenuOpen(false)}>
              分类
            </Link>
            <Link href="/tags" className="block text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all" onClick={() => setIsMenuOpen(false)}>
              标签
            </Link>
            <Link href="/posts/new" className="block text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all" onClick={() => setIsMenuOpen(false)}>
              ✍️ 写文章
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
