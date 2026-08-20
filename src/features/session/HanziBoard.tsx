'use client'
// ─── The tracing board ──────────────────────────────────────────────────────
//
// «تعلّم الكتابة» is the thing no Arabic-language competitor offers, so this is
// not a decorative animation: the learner draws the character stroke by stroke
// and is corrected on the spot.
//
// hanzi-writer is loaded from a CDN at first use rather than bundled. It is
// ~40KB plus a per-character data fetch, and a learner who never reaches a
// writing drill should not pay for it. If the network refuses it, the board
// falls back to showing the character and the drill passes rather than blocking
// the unit — a missing script is not the learner's mistake.

import { useCallback, useEffect, useRef, useState } from 'react'
import { RotateCcw, Eye, SkipForward } from 'lucide-react'
import { Hanzi } from './parts'
import { makeT, type Locale } from '@/lib/locale'

const CDN = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js'

interface WriterInstance {
  quiz(options: {
    onComplete?: (summary: { totalMistakes: number }) => void
    onMistake?: () => void
  }): void
  cancelQuiz?(): void
  animateCharacter(): void
}

interface WriterCtor {
  create(el: HTMLElement, char: string, options: Record<string, unknown>): WriterInstance
}

type LoadState = 'loading' | 'ready' | 'unavailable'

function existingWriter(): WriterCtor | null {
  return (window as unknown as { HanziWriter?: WriterCtor }).HanziWriter ?? null
}

export function HanziBoard({
  char,
  disabled,
  onComplete,
  locale,
}: {
  char: string
  disabled: boolean
  /** `true` when the character was drawn with no mistakes. */
  onComplete: (clean: boolean) => void
  locale: Locale
}) {
  const t = makeT(locale)
  const hostRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<WriterInstance | null>(null)
  const [load, setLoad] = useState<LoadState>(() =>
    typeof window !== 'undefined' && existingWriter() ? 'ready' : 'loading',
  )
  const [mistakes, setMistakes] = useState(0)

  // Load the library once per page. The script tag is the external system this
  // effect synchronises with, and every `setLoad` happens in one of ITS
  // callbacks — never synchronously in the effect body, which would cascade a
  // render for a state the initialiser already knew.
  useEffect(() => {
    if (load !== 'loading') return
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CDN}"]`)
    if (existing) {
      // Another board already started the download; ride its events instead of
      // adding a second tag. Two mounted write drills used to fetch it twice.
      existing.addEventListener('load', onLoaded)
      existing.addEventListener('error', onFailed)
      return () => {
        existing.removeEventListener('load', onLoaded)
        existing.removeEventListener('error', onFailed)
      }
    }
    const script = document.createElement('script')
    script.src = CDN
    script.async = true
    script.addEventListener('load', onLoaded)
    script.addEventListener('error', onFailed)
    document.head.appendChild(script)
    return () => {
      script.removeEventListener('load', onLoaded)
      script.removeEventListener('error', onFailed)
    }
    function onLoaded() { setLoad('ready') }
    function onFailed() { setLoad('unavailable') }
  }, [load])

  const startQuiz = useCallback(() => {
    const HW = existingWriter()
    const host = hostRef.current
    if (!HW || !host) return
    host.innerHTML = ''
    setMistakes(0)
    const writer = HW.create(host, char, {
      width: 260,
      height: 260,
      padding: 6,
      showCharacter: false,
      showOutline: true,
      showHintAfterMisses: 2,
      strokeAnimationSpeed: 1.1,
      drawingWidth: 26,
    })
    writerRef.current = writer
    writer.quiz({
      onMistake: () => setMistakes((n) => n + 1),
      onComplete: (summary) => onComplete(summary.totalMistakes === 0),
    })
  }, [char, onComplete])

  useEffect(() => {
    if (load !== 'ready') return
    startQuiz()
    return () => {
      writerRef.current?.cancelQuiz?.()
      writerRef.current = null
    }
  }, [load, startQuiz])

  if (load === 'unavailable') {
    return (
      <div className="j-board j-board-fallback">
        <Hanzi text={char} size="xl" />
        <p>
          {t(
            'تعذّر تحميل لوح التتبّع. تابع، وسنعيد المحاولة في الحرف القادم.',
            'The tracing board would not load. Carry on — we will try again on the next character.',
          )}
        </p>
        <button type="button" className="j-ready" onClick={() => onComplete(true)}>
          {t('تابع', 'Continue')}
        </button>
      </div>
    )
  }

  return (
    <div className="j-board">
      <div
        ref={hostRef}
        className="j-board-canvas"
        aria-label={t(`لوح كتابة الحرف ${char}`, `Tracing board for the character ${char}`)}
      />
      {load === 'loading' && <div className="j-board-loading" aria-busy="true" />}
      <div className="j-board-tools">
        <button type="button" className="j-board-tool" onClick={startQuiz} disabled={disabled}>
          <RotateCcw size={16} aria-hidden /> <span>{t('من البداية', 'Start over')}</span>
        </button>
        <button
          type="button"
          className="j-board-tool"
          onClick={() => writerRef.current?.animateCharacter()}
          disabled={disabled}
        >
          <Eye size={16} aria-hidden /> <span>{t('أرِني', 'Show me')}</span>
        </button>
        {mistakes > 0 && (
          <span className="j-board-mistakes">
            {t(`${mistakes} خطأ`, `${mistakes} ${mistakes === 1 ? 'mistake' : 'mistakes'}`)}
          </span>
        )}
      </div>

      {/*
        A way past the board. Writing is the one drill that needs a steady hand
        on a small screen, and it sits on the MANDATORY path — so without this
        a learner with a shaky touch, a stylus-less tablet or simply no patience
        today is stuck on one character with no route forward and no way to
        finish the unit. Skipping is marked wrong, so SRS brings the character
        back; it does not pretend the stroke order was learned.
      */}
      <button type="button" className="j-board-skip" onClick={() => onComplete(false)} disabled={disabled}>
        <SkipForward size={14} aria-hidden />
        <span>{t('تخطَّ هذا الحرف — سيعود عليك لاحقاً', 'Skip this character — it will come back to you later')}</span>
      </button>
    </div>
  )
}
