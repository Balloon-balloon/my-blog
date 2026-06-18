'use client'

import { useState, useEffect, useCallback } from 'react'

type Quote = { text: string; source: string }
type QuoteCategory = 'anime' | 'philosophy' | 'english'

const QUOTES: Record<QuoteCategory, Quote[]> = {
  anime: [
    { text: '人如果没有梦想，那跟咸鱼有什么区别？', source: '《海贼王》' },
    { text: '我要成为火影！', source: '《火影忍者》' },
    { text: '真相只有一个！', source: '《名侦探柯南》' },
    { text: '既然你诚心诚意地发问了，我们就大发慈悲地告诉你！', source: '《宝可梦》' },
    { text: '不要低头，皇冠会掉；不要流泪，坏人会笑。', source: '《银魂》' },
    { text: '即使是奇迹，也需要一点时间。', source: '《CLANNAD》' },
    { text: '只要活着，就一定能遇见好事。', source: '《樱桃小丸子》' },
    { text: '我不会逃避，我会一直向前。', source: '《进击的巨人》' },
    { text: '人的梦想，是不会终结的！', source: '《海贼王》' },
    { text: '正因为没有翅膀，人们才会寻找飞翔的方法。', source: '《排球少年》' },
    { text: '即使痛苦，也要继续前行，这就是人生。', source: '《东京喰种》' },
    { text: '与其想着如何美丽地死去，还不如漂亮地活到最后一刻。', source: '《银魂》' },
    { text: '不管前方的路有多苦，只要走的方向正确，都比站在原地更接近幸福。', source: '《千与千寻》' },
    { text: '世界这么大，人生这么长，总会有这么一个人，让你想要温柔地对待。', source: '《哈尔的移动城堡》' },
    { text: '生活坏到一定程度就会好起来，因为它无法更坏。', source: '《龙猫》' },
  ],
  philosophy: [
    { text: '我的心略大于整个宇宙。', source: '佩索阿' },
    { text: '我寻找的是永恒，却只找到了时间。', source: '博尔赫斯' },
    { text: '岁月不饶人，我亦未曾饶过岁月。', source: '木心' },
    { text: '人生不如一行波德莱尔。', source: '芥川龙之介' },
    { text: '所谓无底深渊，下去，也是前程万里。', source: '木心' },
    { text: '我生活在自己的光里面，我不断啜饮内心的火焰。', source: '尼采' },
    { text: '你担心什么，什么就控制你。', source: '约翰·洛克' },
    { text: '一个人只有在独处时才能成为自己。', source: '叔本华' },
    { text: '我们生而破碎，用活着来修修补补。', source: '尤金·奥尼尔' },
    { text: '世界上只有一种英雄主义，就是在认清生活真相之后依然热爱生活。', source: '罗曼·罗兰' },
    { text: '你生而有翼，为何竟愿一生匍匐前进，形如虫蚁？', source: '鲁米' },
    { text: '万物皆有裂痕，那是光照进来的地方。', source: '莱昂纳德·科恩' },
    { text: '人生天地间，忽如远行客。', source: '《古诗十九首》' },
    { text: '人生如逆旅，我亦是行人。', source: '苏轼' },
    { text: '世间好物不坚牢，彩云易散琉璃脆。', source: '白居易' },
  ],
  english: [
    { text: 'To be, or not to be, that is the question.', source: 'William Shakespeare — 生存还是毁灭，这是一个问题。' },
    { text: 'Stay hungry, stay foolish.', source: 'Steve Jobs — 求知若饥，虚心若愚。' },
    { text: 'In the middle of difficulty lies opportunity.', source: 'Albert Einstein — 困境之中蕴藏着机遇。' },
    { text: 'The unexamined life is not worth living.', source: 'Socrates — 未经审视的人生不值得过。' },
    { text: 'What does not kill me makes me stronger.', source: 'Friedrich Nietzsche — 杀不死我的，使我更强大。' },
    { text: 'Happiness depends upon ourselves.', source: 'Aristotle — 幸福取决于我们自己。' },
    { text: 'It is never too late to be what you might have been.', source: 'George Eliot — 成为你想成为的人，永远都不晚。' },
    { text: 'The only way to do great work is to love what you do.', source: 'Steve Jobs — 做伟大的工作的唯一途径是热爱你所做的事。' },
    { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', source: 'Aristotle — 我们反复做的事，决定了我们是怎样的人。因此，卓越不是一种行为，而是一种习惯。' },
    { text: 'Do not go gentle into that good night.', source: 'Dylan Thomas — 不要温和地走进那个良夜。' },
    { text: 'I think, therefore I am.', source: 'René Descartes — 我思故我在。' },
    { text: 'The journey of a thousand miles begins with a single step.', source: 'Lao Tzu — 千里之行，始于足下。' },
    { text: 'Not all those who wander are lost.', source: 'J.R.R. Tolkien — 并非所有流浪的人都迷失了方向。' },
    { text: 'Hope is a good thing, maybe the best of things.', source: 'Stephen King — 希望是美好的，也许是人间至善。' },
    { text: 'Carpe diem. Seize the day, boys.', source: 'Horace / Dead Poets Society — 把握今朝，及时行乐。' },
  ],
}

const TABS: { key: QuoteCategory; label: string }[] = [
  { key: 'anime', label: '💭 动漫' },
  { key: 'philosophy', label: '📖 哲理' },
  { key: 'english', label: '🌍 英文' },
]

export default function AnimeQuote() {
  const [category, setCategory] = useState<QuoteCategory>('anime')
  const [quote, setQuote] = useState(QUOTES.anime[0])
  const [fadeIn, setFadeIn] = useState(true)

  const getRandomQuote = useCallback((cat: QuoteCategory) => {
    const list = QUOTES[cat]
    const randomIndex = Math.floor(Math.random() * list.length)
    return list[randomIndex]
  }, [])

  const handleSwitch = useCallback(
    (cat?: QuoteCategory) => {
      const target = cat ?? category
      setFadeIn(false)
      setTimeout(() => {
        setQuote(getRandomQuote(target))
        setFadeIn(true)
      }, 300)
    },
    [category, getRandomQuote]
  )

  const handleCategoryChange = useCallback(
    (cat: QuoteCategory) => {
      if (cat === category) return
      setCategory(cat)
      handleSwitch(cat)
    },
    [category, handleSwitch]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      handleSwitch()
    }, 10000)
    return () => clearInterval(interval)
  }, [handleSwitch])

  return (
    <div className="text-center py-6 px-4">
      {/* 分类切换标签 */}
      <div className="flex justify-center gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleCategoryChange(tab.key)}
            className={`px-3 py-1 rounded-full text-sm transition-all duration-300 border ${
              category === tab.key
                ? 'bg-white/20 text-white border-white/40 shadow-sm'
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 语录内容 */}
      <div
        onClick={() => handleSwitch()}
        style={{ cursor: 'pointer' }}
      >
        <div
          className={`transition-all duration-300 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="text-white/80 text-lg italic font-light leading-relaxed">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-white/50 text-sm mt-2">
            —— {quote.source}
          </p>
        </div>
        <p className="text-white/30 text-xs mt-3">
          点击切换语录 · 每10秒自动切换
        </p>
      </div>
    </div>
  )
}
