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

/**
 * Read a value that only exists in the browser, safely across hydration.
 *
 * Returns `serverValue` on the server AND on the first client render, then the
 * real value. Use it for anything derived from the persisted store in a
 * component that the server prerenders.
 *
 * This exists because the failure it prevents is silent and structural. The
 * bottom bar rendered its review badge as `{dueCount > 0 && <span/>}`: with no
 * stored progress the server omitted the element, and a returning learner's
 * first client render added it — a different tree, so React threw the whole
 * page away and rebuilt it (hydration error #418). Nothing looked wrong on
 * screen; it just cost a full re-render on every navigation, and only appeared
 * for learners who had actually used the app.
 *
 * A conditional ELEMENT is the dangerous case. Differing text is a warning;
 * a differing tree is a rebuild.
 */
export function usePersisted<T>(value: T, serverValue: T): T {
  return useMounted() ? value : serverValue
}
