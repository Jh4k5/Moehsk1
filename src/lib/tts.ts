// ─── نطق مركزي يقرأ إعدادات المستخدم (الصوت والسرعة) من المتجر ──────────────
import { useLearningStore } from './store'

export function getChineseVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('zh'))
}

/** يختار أفضل صوت صيني متاح: صوت المستخدم المحفوظ ← أصوات طبيعية معروفة ← أي صوت zh-CN */
function pickVoice(ttsVoiceURI: string | null): SpeechSynthesisVoice | null {
  const all = window.speechSynthesis.getVoices()
  if (ttsVoiceURI) {
    const saved = all.find((v) => v.voiceURI === ttsVoiceURI)
    if (saved) return saved
  }
  const zh = all.filter((v) => v.lang.toLowerCase().startsWith('zh'))
  if (!zh.length) return null
  const preferred = ['xiaoxiao', 'yunxi', 'google', 'huihui', 'kangkang', 'yaoyao']
  for (const p of preferred) {
    const hit = zh.find((v) => v.name.toLowerCase().includes(p))
    if (hit) return hit
  }
  return zh.find((v) => v.lang === 'zh-CN') || zh[0]
}

export function speak(text: string, lang = 'zh-CN') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  const { ttsRate, ttsVoiceURI } = useLearningStore.getState().settings
  u.rate = ttsRate
  if (lang.toLowerCase().startsWith('zh')) {
    const voice = pickVoice(ttsVoiceURI)
    if (voice) u.voice = voice
  }
  window.speechSynthesis.speak(u)
}
