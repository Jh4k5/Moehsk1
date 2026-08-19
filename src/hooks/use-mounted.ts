'use client'

import { useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}
const onClient = () => true
const onServer = () => false

/**
 * `false` while rendering on the server and during the first client render,
 * `true` from the second render on.
 *
 * For the narrow case of markup that CANNOT match between server and client —
 * the stored theme, a locale-formatted date, anything read from the browser
 * itself. Render the server's answer first, then correct it; that is what keeps
 * hydration silent instead of letting React throw away the tree.
 *
 * Implemented with `useSyncExternalStore` rather than `useEffect` + `setState`
 * so it neither triggers a cascading render nor trips
 * `react-hooks/set-state-in-effect`.
 *
 * NOT a general escape hatch: gating a whole section behind this is what
 * reduced the crawlable page to one character. Gate the single attribute that
 * genuinely differs, nothing above it.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, onClient, onServer)
}
