'use client'
// ─── المعلّم بمستويين ───────────────────────────────────────────────────────
//
// محرك القواعد يعمل هنا في المتصفح: يقرأ تقدّم الطالب الحقيقي من المتجر ويجيب
// فوراً بلا شبكة ولا تكلفة. لا يخرج طلب واحد إلى /api/tutor إلا حين يعلن
// المحرك عجزه (`resolved === false`) — والخادم يعيد الحكم بنفسه على كل حال،
// فلا يستطيع هذا الملف أن يفتعل استدعاءً مدفوعاً.
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, RotateCcw, Send } from 'lucide-react'
import { answerMessage, type TutorQuiz } from '@/lib/tutor/engine'
import { useActiveLevel } from '@/lib/levels'
import { ts } from '@/lib/i18n'
import { useLearningStore } from '@/lib/store'
import { type VocabWord } from '@/data/vocabulary'

/** حالة الطبقة الثانية كما يرويها الخادم — لا يُقرَّر منها شيء هنا، إنما تُعرض. */
interface TutorStatus {
  tutorEnabled: boolean
  signedIn: boolean
  isSubscriber: boolean
  modelConfigured: boolean
  limit: number
  used: number | null
  remaining: number | null
  notice: string | null
}

interface TutorApiResponse {
  ok: boolean
  tier?: 'rules' | 'model'
  text?: string
  followUps?: string[]
  notice?: string
  code?: string
  usage?: { used: number; limit: number; remaining: number } | null
  error?: string
}

export default function ChatSection() {
  const store = useLearningStore()
  const activeLevelBundle = useActiveLevel()
  const { vocabulary, level } = activeLevelBundle
  const [input, setInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [followUps, setFollowUps] = useState<string[]>([])
  const pendingQuizRef = useRef<TutorQuiz | null>(null)
  const [status, setStatus] = useState<TutorStatus | null>(null)
  // أي طبقة أجابت آخر مرة، وما التنبيه المرافق. يُعرضان على آخر رد فقط: التاريخ
  // محفوظ في المتجر بلا هذه البيانات، وادّعاء طبقةٍ لرسالة قديمة سيكون كذباً.
  const [lastTier, setLastTier] = useState<'rules' | 'model' | null>(null)
  const [lastNotice, setLastNotice] = useState<string | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [store.chatMessages])

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/tutor', { method: 'GET' })
      if (!res.ok) return
      setStatus((await res.json()) as TutorStatus)
    } catch {
      // الحالة زينة معلوماتية: تعذّر جلبها لا يمنع محرك القواعد من العمل.
    }
  }, [])

  // بعد أول رسم لا في أثنائه: حالة الاشتراك والرصيد معلومة خادمية، وجلبها
  // متزامناً داخل التأثير يُسلسل رسمات لا لزوم لها.
  useEffect(() => {
    const t = setTimeout(() => void refreshStatus(), 0)
    return () => clearTimeout(t)
  }, [refreshStatus])

  /** الطبقة الثانية: تُستدعى فقط بعد أن يعلن المحرك عجزه. */
  const askServer = async (userMsg: string, fallbackText: string) => {
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, level, lang: store.lang }),
      })
      const data = (await res.json()) as TutorApiResponse
      store.addChatMessage({ role: 'assistant', content: data.text || fallbackText })
      setLastTier(data.tier ?? 'rules')
      setLastNotice(data.notice ?? null)
      setFollowUps(data.followUps || [])
      if (data.usage) {
        setStatus((prev) =>
          prev ? { ...prev, used: data.usage!.used, remaining: data.usage!.remaining, limit: data.usage!.limit } : prev,
        )
      } else {
        void refreshStatus()
      }
    } catch {
      store.addChatMessage({ role: 'assistant', content: fallbackText })
      setLastTier('rules')
      setLastNotice(ts('تعذّر الاتصال بالمعلّم الذكي. هذه إجابة محرك الشرح المجاني.', 'Could not reach the AI tutor. This is the free rule engine answer.'))
    }
  }

  const handleSend = (text?: string) => {
    const userMsg = (text ?? input).trim()
    if (!userMsg || isTyping) return
    setInput('')
    setFollowUps([])
    setLastNotice(null)
    store.addChatMessage({ role: 'user', content: userMsg })
    setIsTyping(true)

    setTimeout(async () => {
      const weakWords = store
        .getWeakWordIds(10)
        .map((id) => vocabulary.find((w) => w.id === id))
        .filter((w): w is VocabWord => !!w)
      const srsStats = store.getSRSStats()
      const reply = answerMessage(userMsg, {
        learnedWordIds: store.learnedWords,
        weakWords,
        dueCount: store.getDueCardIds().length,
        masteredCount: srsStats.mastered,
        dailyStreak: store.dailyStreak,
        dailyGoal: store.profile?.dailyGoal ?? 10,
        pendingQuiz: pendingQuizRef.current,
        level,
        lang: store.lang,
        vocabulary,
        grammarRules: activeLevelBundle.grammarRules,
        grammarPractice: activeLevelBundle.grammarPractice,
      })
      if (reply.quiz !== undefined) pendingQuizRef.current = reply.quiz

      if (reply.resolved === false) {
        // عجز المحرك: هنا وحده يجوز أن يكلّف السؤال شيئاً.
        await askServer(userMsg, reply.text)
      } else {
        store.addChatMessage({ role: 'assistant', content: reply.text })
        setLastTier('rules')
        setFollowUps(reply.followUps || [])
      }
      setIsTyping(false)
    }, 400 + Math.random() * 400)
  }

  /** سطر الحالة: ما الذي يعمل الآن، وكم بقي للطالب اليوم. */
  const statusLine = (() => {
    if (!status) return null
    if (!status.tutorEnabled) return ts('المعلّم الذكي موقوف — محرك الشرح المجاني يعمل.', 'AI tutor is off — the free rule engine is running.')
    if (!status.modelConfigured) return ts('المعلّم الذكي غير مهيّأ على الخادم — محرك الشرح المجاني يعمل.', 'AI tutor is not configured — the free rule engine is running.')
    if (!status.signedIn) return ts('سجّل الدخول لتسأل المعلّم الذكي عمّا يعجز عنه الشرح الآلي.', 'Sign in to ask the AI tutor what the rule engine cannot answer.')
    if (!status.isSubscriber) return ts('المعلّم الذكي للمشتركين — شرح الكلمات والقواعد مجاني للجميع.', 'The AI tutor is for subscribers — word and grammar explanations are free for everyone.')
    if (status.remaining === null) return null
    return ts(
      `بقي لك ${status.remaining} من ${status.limit} سؤالاً للمعلّم الذكي اليوم.`,
      `${status.remaining} of ${status.limit} AI tutor questions left today.`,
    )
  })()

  const quickQuestions = [
    ts('ما معنى 你好؟', 'What does 你好 mean?'),
    ts('اختبرني', 'Quiz me'),
    ts('اشرح قاعدة 吗', 'Explain the 吗 rule'),
    ts('ماذا أراجع اليوم؟', 'What should I review today?'),
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          {ts('المساعد الذكي','AI Tutor')}
        </h2>
        <Button variant="ghost" size="sm" onClick={store.clearChatMessages}>
          <RotateCcw className="w-4 h-4 me-1" /> {ts('مسح', 'Clear')}
        </Button>
      </div>
      <p className="text-[var(--text-muted)] text-sm">{ts('اسألني عن أي كلمة صينية أو احصل على نصائح للتعلم!','Ask me about any Chinese word or get study tips!')}</p>
      {statusLine && (
        <p className="text-xs text-[var(--text-muted)] border-s-2 border-primary/40 ps-2">{statusLine}</p>
      )}

      {/* Chat Messages */}
      <Card className="j-card border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto custom-scrollbar p-4 space-y-4" id="chat-container">
            {store.chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{ts('مرحباً! أنا مساعدك الصيني 🤖','Hi! I am your Chinese tutor 🤖')}</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{ts('اسألني عن أي كلمة أو اطلب نصائح للتعلم','Ask me about any word or request study tips')}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {quickQuestions.map(q => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSend(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {store.chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={msg.role === 'user' ? "flex justify-start" : "flex justify-end"}
              >
                <div className={msg.role === 'user'
                    ? "max-w-[80%] rounded-2xl px-4 py-3 bg-primary text-white rounded-br-sm"
                    : "max-w-[80%] rounded-2xl px-4 py-3 bg-[var(--surface-card-h)] text-[var(--text-primary)] rounded-bl-sm"
                }>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Bot className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium text-primary">{ts('المعلم','Tutor')}</span>
                      {i === store.chatMessages.length - 1 && lastTier && (
                        <span className="text-[10px] rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                          {lastTier === 'model'
                            ? ts('المعلّم الذكي', 'AI tutor')
                            : ts('شرح مجاني', 'free rule engine')}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</div>
                  {msg.role === 'assistant' && i === store.chatMessages.length - 1 && lastNotice && (
                    <div className="mt-2 text-xs text-[var(--text-muted)] border-t border-[var(--text-muted)]/20 pt-2">
                      {lastNotice}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex justify-end">
                <div className="bg-[var(--surface-card-h)] rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {!isTyping && followUps.length > 0 && store.chatMessages.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {followUps.map(f => (
                  <Button
                    key={f}
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-full"
                    onClick={() => handleSend(f)}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder={ts('اكتب سؤالك هنا... (عربي أو صيني)','Type your question... (English or Chinese)')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
          disabled={isTyping}
        />
        <Button onClick={() => handleSend()} className="bg-primary hover:brightness-110" disabled={!input.trim() || isTyping}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
