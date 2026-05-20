'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useLearningStore } from '@/lib/store'
import { getChatResponse } from '@/lib/helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bot, RotateCcw, Send, Mic } from 'lucide-react'
import { motion } from 'framer-motion'

// ─── Markdown Helper ─────────────────────────────────────
const renderMarkdown = (text: string) => {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

// ═══════════════════════════════════════════════════════════
// CHAT SECTION (AI Assistant)
// ═══════════════════════════════════════════════════════════
export function ChatSection() {
  const store = useLearningStore()
  const [input, setInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [store.chatMessages])
  const [aiSource, setAiSource] = useState<'ai' | 'fallback'>('fallback')
  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    store.addChatMessage({ role: 'user', content: userMsg })
    setIsTyping(true)
    // Try API first, fall back to local
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context: 'HSK 1 Chinese Learning' }),
      })
      if (res.ok) {
        const data = await res.json()
        store.addChatMessage({ role: 'assistant', content: data.message })
        setAiSource(data.source || 'fallback')
        setIsTyping(false)
        return
      }
    } catch { /* API unavailable, fall back */ }
    // Fallback to local rule-based response
    setTimeout(() => {
      const response = getChatResponse(userMsg)
      store.addChatMessage({ role: 'assistant', content: response })
      setAiSource('fallback')
      setIsTyping(false)
    }, 600 + Math.random() * 800)
  }
  const quickQuestions = [
    '🔤 اشرح لي نطق هذه الكلمة',
    '📝 صحح هذه الجملة',
    '💬 تمرين محادثة',
    '❓ اسألني عن كلمة',
    '📊 قيّم مستواي',
  ]
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-red-600" />
            المساعد الذكي
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
        </div>
        <Button variant="ghost" size="sm" onClick={store.clearChatMessages}>
          <RotateCcw className="w-4 h-4 ml-1" /> مسح
        </Button>
        <Badge variant="secondary" className={`text-[10px] ${aiSource === 'ai' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
          {aiSource === 'ai' ? '🤖 ذكاء اصطناعي' : '💡 محلي'}
        </Badge>
      </div>
      <p className="text-gray-500 text-sm">اسألني عن أي كلمة صينية أو احصل على نصائح للتعلم!</p>
      {/* Chat Messages */}
      <Card className="j-card border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto custom-scrollbar p-4 space-y-4" id="chat-container">
            {store.chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">مرحباً! أنا مساعدك الصيني 🤖</h3>
                  <p className="text-sm text-gray-500 mt-1">اسألني عن أي كلمة أو اطلب نصائح للتعلم</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {quickQuestions.map(q => {
                    const prefixes: Record<string, string> = {
                      '🔤 اشرح لي نطق هذه الكلمة': 'اشرح نطق هذه الكلمة وأعطني مثالاً: ',
                      '📝 صحح هذه الجملة': 'صحح هذه الجملة الصينية وأخبرني الخطأ: ',
                      '💬 تمرين محادثة': 'ابدأ معي محادثة قصيرة بسيطة بالصينية وصحح ردودي',
                      '❓ اسألني عن كلمة': 'اسألني عن معنى أي كلمة HSK 1 وانتظر إجابتي',
                      '📊 قيّم مستواي': 'قيّم مستواي في HSK 1 بناءً على ما تعلمته حتى الآن',
                    }
                    return (
                      <Button key={q} variant="outline" size="sm" className="text-xs" onClick={() => setInput(prefixes[q] || q)}>
                        {q}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}
            {store.chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Bot className="w-3 h-3 text-red-500" />
                      <span className="text-xs font-medium text-red-600">المعلم</span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-line leading-relaxed">{msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}</div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex justify-end">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </CardContent>
      </Card>
      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="اكتب سؤالك هنا... (عربي أو صيني)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
          disabled={isTyping}
        />
        <button
          onClick={() => {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return
            const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            const recognition = new SpeechRec()
            recognition.lang = 'ar-SA'
            recognition.onresult = (event: any) => {
              const text = event.results[0][0].transcript
              setInput(text)
            }
            recognition.start()
          }}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <Mic className="w-4 h-4 text-gray-500" />
        </button>
        <Button onClick={handleSend} className="bg-red-600 hover:bg-red-700" disabled={!input.trim() || isTyping}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
