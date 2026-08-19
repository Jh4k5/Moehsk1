// ─── The identity as a surface, not a touch ─────────────────────────────────
// The bridge arch from the logo repeats as ornament on every dark surface, and
// 桥 sits behind it as a watermark. Both are decorative: `aria-hidden`, no text
// content, so they never reach a screen reader or the crawler's text budget.
// Pure server component — no state, no client bundle.

export function BridgeArch({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 390 150"
      fill="none"
      aria-hidden="true"
      className={'pointer-events-none absolute bottom-[-22px] w-[390px] max-w-none opacity-[0.16] ' + className}
      style={{ insetInlineStart: '-30px' }}
    >
      <path d="M-10 120 C 60 40, 150 40, 200 120" stroke="var(--brand-gold)" strokeWidth="2.5" />
      <path d="M60 120 C 110 62, 190 62, 250 120" stroke="var(--brand-red)" strokeWidth="2.5" />
      <path d="M-10 121 H 300" stroke="var(--brand-gold)" strokeWidth="1.5" />
    </svg>
  )
}

/** The wider arch with piers, for tall hero surfaces (the landing page). */
export function BridgeArchWide({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 390 180"
      fill="none"
      aria-hidden="true"
      className={'pointer-events-none absolute bottom-[-26px] w-[390px] max-w-none opacity-[0.14] ' + className}
      style={{ insetInlineStart: '-20px' }}
    >
      <path d="M-20 150 C 70 46, 250 46, 340 150" stroke="var(--brand-gold)" strokeWidth="2.5" />
      <path d="M40 150 C 110 78, 240 78, 310 150" stroke="var(--brand-red)" strokeWidth="2.5" />
      <path d="M-20 151 H 400" stroke="var(--brand-gold)" strokeWidth="1.5" />
      <path d="M85 151 V 100" stroke="var(--brand-gold)" strokeWidth="1.2" />
      <path d="M180 151 V 84" stroke="var(--brand-gold)" strokeWidth="1.2" />
      <path d="M275 151 V 100" stroke="var(--brand-gold)" strokeWidth="1.2" />
    </svg>
  )
}

/**
 * The 桥 watermark. `aria-hidden` matters here: it is the single character the
 * crawler used to see as the whole page, and it must never count as content
 * again.
 */
export function HanziWatermark({
  char = '桥',
  size = 130,
  className = '',
  style,
}: {
  char?: string
  size?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      className={'font-chinese pointer-events-none absolute select-none leading-none font-black ' + className}
      style={{ fontSize: size, color: 'rgba(247,244,239,.045)', ...style }}
    >
      {char}
    </span>
  )
}
