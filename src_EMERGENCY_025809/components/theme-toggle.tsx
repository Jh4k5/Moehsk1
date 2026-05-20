'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        <div className="w-4 h-4" />
      </button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          }}
          title="تبديل السمة"
        >
          {isDark ? (
            <Moon className="w-4 h-4" style={{ color: '#FCD34D' }} />
          ) : (
            <Sun className="w-4 h-4" style={{ color: '#D97706' }} />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        <DropdownMenuItem onClick={() => setTheme('light')} className="gap-3 cursor-pointer">
          <Sun className="w-4 h-4" style={{ color: '#D97706' }} />
          <span>الوضع النهاري</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-3 cursor-pointer">
          <Moon className="w-4 h-4" style={{ color: '#F59E0B' }} />
          <span>الوضع الليلي</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="gap-3 cursor-pointer">
          <Monitor className="w-4 h-4" style={{ color: '#64748B' }} />
          <span>تلقائي</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
