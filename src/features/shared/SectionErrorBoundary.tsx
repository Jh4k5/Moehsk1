'use client'
// ─── Keeps one broken section from taking the whole route down ──────────────
import React from 'react'
import { ts } from '@/lib/i18n'

// ═══ Error Boundary ═══
export class SectionErrorBoundary extends React.Component<
  {children: React.ReactNode; sectionName: string},
  {hasError: boolean; error: string}
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/60">
          <div className="text-4xl">⚠️</div>
          <div className="text-lg font-arabic">{ts('حدث خطأ في قسم', 'Something broke in')} {this.props.sectionName}</div>
          <div className="text-sm text-[var(--clr-danger)] max-w-md text-center">{this.state.error}</div>
          <button
            onClick={() => this.setState({ hasError: false, error: '' })}
            className="px-4 py-2 j-btn-primary rounded-lg"
          >
            {ts('إعادة المحاولة', 'Try again')}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

