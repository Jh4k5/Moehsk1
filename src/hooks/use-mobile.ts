'use client'

import * as React from 'react'

/**
 * THE breakpoint. One number, imported by every consumer.
 *
 * There used to be three: this hook said 768, `globals.css` hid the bottom bar
 * at 768, and the JSX hid it at `lg` (1024) — so between 768px and 1023px the
 * page had no bottom bar, no sidebar, and 6rem of padding reserved for a bar
 * that was not there. The layout switches once, at `lg`: phone/tablet get the
 * bottom bar plus a drawer, desktop gets the rail.
 *
 * Keep in sync with `--bp-desktop` in `globals.css` (same value, stated once
 * on each side of the language boundary).
 */
export const DESKTOP_BREAKPOINT = 1024

const QUERY = `(min-width: ${DESKTOP_BREAKPOINT}px)`

/**
 * Subscribe through `useSyncExternalStore` rather than `useEffect` + setState:
 * no cascading render, no `react-hooks/set-state-in-effect` error, and an
 * explicit server snapshot instead of `undefined`.
 */
function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getDesktopSnapshot(): boolean {
  return window.matchMedia(QUERY).matches
}

/**
 * Server snapshot: mobile-first. ~90% of usage is on a phone, so the phone
 * layout is the one the server renders and the desktop is the widening.
 */
function getServerSnapshot(): boolean {
  return false
}

/** `true` at >= 1024px — the only width at which the sidebar rail exists. */
export function useIsDesktop(): boolean {
  return React.useSyncExternalStore(subscribe, getDesktopSnapshot, getServerSnapshot)
}

/** `false` at >= 1024px. The inverse of `useIsDesktop`, for readability. */
export function useIsMobile(): boolean {
  return !useIsDesktop()
}
