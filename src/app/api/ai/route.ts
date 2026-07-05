import { NextRequest, NextResponse } from 'next/server'

// 模拟 AI 回复（当没有 API Key 时使用）
function getMockResponse(message: string, context?: string): string {
  const lowerMsg = message.toLowerCase()

  // 基于关键词匹配的智能模拟回复
  if (lowerMsg.includes('摘要') || lowerMsg.includes('总结')) {
    if (context) {
      const lines = context.split('\n').filter(l => l.trim().length > 0)
      const preview = lines.slice(0, 3).join(' ').substring(0, 100)
      return `这是一篇关于「${preview}...」的文章。根据内容分析，本文主要探讨了一些重要话题，涵盖多个方面的见解。建议阅读全文以获取完整的理解和深入的分析。`
    }
    return '请先打开一篇文章，我可以根据文章内容为你生成摘要哦~'
  }

  if (lowerMsg.includes('标题') || lowerMsg.includes('改标题')) {
    if (context) {
      const titles = [
        '深度解析：从核心洞察到前沿趋势',
        '不可错过的干货分享，一文读懂关键要点',
        '探索未知领域：一份全面的分析与思考',
        '从入门到精通：手把手带你掌握核心知识',
        '行业前沿：为什么这个话题值得关注',
      ]
      return `为你推荐以下几个标题：\n\n1. ${titles[0]}\n2. ${titles[1]}\n3. ${titles[2]}\n4. ${titles[3]}\n5. ${titles[4]}\n\n你觉得哪个比较好呢？也可以告诉我你想要的感觉~`
    }
    return '请先打开一篇文章，我可以根据文章内容为你推荐新标题哦~'
  }

  if (lowerMsg.includes('话题') || lowerMsg.includes('推荐')) {
    return `根据当前文章的标签，为你推荐以下相关话题：\n\n1. 技术前沿与趋势洞察\n2. 开源生态与实践分享\n3. 架构设计与性能优化\n4. AI 应用与创新探索\n5. 开发者成长与思考\n\n这些话题都与文章内容密切相关，感兴趣的话可以深入探索~`
  }

  if (lowerMsg.includes('你好') || lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
    return '你好呀~ 我是 AI 小助手，很高兴为你服务！你可以问我任何问题，或者让我帮你分析文章内容、生成摘要、推荐话题等。有什么我能帮到你的吗？'
  }

  if (lowerMsg.includes('你是谁') || lowerMsg.includes('介绍')) {
    return '我是这个博客的 AI 小助手~ 我可以帮你：\n\n- 分析文章内容并生成摘要\n- 为文章推荐更吸引人的标题\n- 根据文章标签推荐相关话题\n- 回答各种问题和闲聊\n\n有什么需要尽管问我吧！'
  }

  if (lowerMsg.includes('谢谢') || lowerMsg.includes('感谢') || lowerMsg.includes('thanks')) {
    return '不客气呀~ 能帮到你我很开心！如果还有其他问题随时问我哦~'
  }

  if (lowerMsg.includes('天气')) {
    return '抱歉，我暂时还没有接入天气查询功能。不过我可以帮你分析文章、生成摘要、推荐话题等，试试这些功能吧~'
  }

  if (lowerMsg.includes('时间') || lowerMsg.includes('日期')) {
    const now = new Date()
    return `现在是 ${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}。有什么我可以帮你的吗？`
  }

  if (lowerMsg.includes('怎么') || lowerMsg.includes('如何') || lowerMsg.includes('what') || lowerMsg.includes('how')) {
    return `这是一个很好的问题！不过我目前是模拟模式，建议的回复有限。如果你想要更智能的回答，可以配置 Google AI API Key 启用完整功能。\n\n你可以尝试让我：\n- 帮你写摘要\n- 帮你改标题\n- 推荐相关话题\n\n这些功能不需要 API Key 也能工作哦~`
  }

  // 默认回复
  const defaults = [
    '嗯嗯，我听到了~ 虽然我目前是模拟模式，但我正在努力学习中！你可以试试让我帮你分析文章、写摘要或者推荐话题~',
    '好有趣的问题！不过我现在是模拟回复模式，暂时无法给出很详细的回答。试试让我帮你处理文章相关的事情吧~',
    '我理解你的意思啦~ 不过我还需要更多学习才能完美回答这个问题。目前我可以帮你做文章分析、生成摘要、推荐标题等任务哦~',
  ]
  return defaults[Math.floor(Math.random() * defaults.length)]
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的消息内容' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_AI_KEY

    // 如果没有 API Key，使用模拟回复
    if (!apiKey) {
      const reply = getMockResponse(message, context)
      return NextResponse.json({ reply })
    }

    // 使用 Google Gemini API
    const systemPrompt = `你是一个友好、可爱的AI助手，服务于一个二次元风格的个人博客。请用简洁、有趣、友好的语气回答用户的问题。如果用户的问题是关于文章内容的，请基于提供的上下文信息来回答。回复使用中文。`

    const fullPrompt = context
      ? `${systemPrompt}\n\n当前文章上下文：\n标题：${context}\n\n用户问题：${message}`
      : `${systemPrompt}\n\n用户问题：${message}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText)
      // API 调用失败时降级到模拟回复
      const reply = getMockResponse(message, context)
      return NextResponse.json({ reply })
    }

    const data = await response.json()
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      '抱歉，我暂时无法理解你的问题，请稍后再试~'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('AI API error:', error)
    // 出错时降级到模拟回复
    const reply = getMockResponse(
      request.body ? '通用问题' : '你好',
      undefined
    )
    return NextResponse.json({ reply })
  }
}
