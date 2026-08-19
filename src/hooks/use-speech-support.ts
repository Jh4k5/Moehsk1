'use client'

import { useSyncExternalStore } from 'react'

// ─── Does this browser do speech recognition? ───────────────────────────────
// A capability of the browser, not state of the app: it is decided before the
// page loads and never changes. Reading it with `useEffect` + `setState` meant
// every pronunciation screen rendered "unsupported" for one frame and then
// corrected itself, and it tripped `react-hooks/set-state-in-effect` twice.
//
// `useSyncExternalStore` gives an explicit server snapshot (`false` — there is
// no microphone during prerender) and a client snapshot read at render time,
// so the value is right on the first client render with no extra pass.

const noopSubscribe = () => () => {}

function detect(): boolean {
  return typeof window !== 'undefined' &&
    Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
    )
}

const onServer = () => false

/** `true` when the browser exposes the Web Speech recognition API. */
export function useSpeechRecognitionSupport(): boolean {
  return useSyncExternalStore(noopSubscribe, detect, onServer)
}

/** The constructor itself, or null. For the code that actually starts a session. */
export function getSpeechRecognition(): (new () => unknown) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: new () => unknown
    webkitSpeechRecognition?: new () => unknown
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
