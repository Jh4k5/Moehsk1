'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Coffee, Brain, Flame, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type PomodoroMode = 'focus' | 'short-break' | 'long-break'

const MODES: Record<PomodoroMode, { label: string; minutes: number; color: string; bg: string; icon: React.ReactNode }> = {
  'focus': { label: 'تركيز', minutes: 25, color: '#1CB0F6', bg: '#E0F6FF', icon: <Brain className="w-5 h-5" /> },
  'short-break': { label: 'استراحة قصيرة', minutes: 5, color: '#58CC02', bg: '#E5F9DB', icon: <Coffee className="w-5 h-5" /> },
  'long-break': { label: 'استراحة طويلة', minutes: 15, color: '#CE82FF', bg: '#F3E5FF', icon: <Coffee className="w-5 h-5" /> },
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<PomodoroMode>('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [totalMinutesFocused, setTotalMinutesFocused] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentMode = MODES[mode]
  const totalTime = currentMode.minutes * 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  // Play notification sound
  const playNotification = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return
    try {
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.15)
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    } catch { /* ignore */ }
  }, [soundEnabled])

  const switchMode = useCallback((newMode: PomodoroMode) => {
    setMode(newMode)
    setTimeLeft(MODES[newMode].minutes * 60)
    setIsRunning(false)
  }, [])

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setIsRunning(false)
            playNotification()
            
            if (mode === 'focus') {
              const newSessions = sessionsCompleted + 1
              setSessionsCompleted(newSessions)
              setTotalMinutesFocused(prev => prev + currentMode.minutes)
              
              // Every 4 sessions → long break
              if (newSessions % 4 === 0) {
                switchMode('long-break')
              } else {
                switchMode('short-break')
              }
            } else {
              switchMode('focus')
            }
            setShowCelebration(true)
            setTimeout(() => setShowCelebration(false), 2000)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, mode, sessionsCompleted, currentMode.minutes, playNotification, switchMode])

  const reset = () => {
    setTimeLeft(currentMode.minutes * 60)
    setIsRunning(false)
  }

  // Circular progress calculation
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div className="flex gap-2">
        {(Object.entries(MODES) as [PomodoroMode, typeof MODES['focus']][]).map(([key, m]) => (
          <Button
            key={key}
            variant={mode === key ? 'default' : 'outline'}
            size="sm"
            className={`flex-1 gap-1.5 text-xs ${
              mode === key
                ? 'border-0 shadow-sm'
                : 'hover:bg-gray-50'
            }`}
            style={mode === key ? { backgroundColor: m.color, color: 'white' } : { borderColor: m.color, color: m.color }}
            onClick={() => switchMode(key)}
          >
            {m.icon}
            <span className="hidden sm:inline">{m.label}</span>
          </Button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative flex justify-center items-center py-4">
        <div className={`relative ${isRunning ? 'pomodoro-active' : ''}`}>
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke="#E5E5E5"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke={currentMode.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="pomodoro-ring"
            />
          </svg>
          
          {/* Timer text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-4xl font-bold tracking-tight font-mono"
              style={{ color: isRunning ? currentMode.color : '#4B4B4B' }}
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500 mt-1">{currentMode.label}</div>
          </div>

          {/* Celebration effect */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="text-5xl">🎉</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={reset}
          className="h-10 w-10 rounded-full"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={() => setIsRunning(!isRunning)}
          className="h-14 w-14 rounded-full border-0 shadow-md flex items-center justify-center text-white"
          style={{
            backgroundColor: currentMode.color,
            borderBottom: isRunning ? '4px solid' : 'none',
            borderBottomColor: isRunning ? currentMode.color + 'AA' : 'transparent',
          }}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="h-10 w-10 rounded-full"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="p-3">
            <div className="flex items-center justify-center mb-1">
              <Flame className="w-4 h-4 text-amber-500 animate-streak-glow" />
            </div>
            <div className="text-xl font-bold" style={{ color: currentMode.color }}>
              {sessionsCompleted}
            </div>
            <div className="text-[10px] text-gray-500">جلسات مكتملة</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="p-3">
            <div className="text-lg mb-1">⏱️</div>
            <div className="text-xl font-bold text-gray-700">{totalMinutesFocused}</div>
            <div className="text-[10px] text-gray-500">دقائق تركيز</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="p-3">
            <div className="text-lg mb-1">🎯</div>
            <div className="text-xl font-bold text-gray-700">
              {sessionsCompleted > 0 ? Math.round((sessionsCompleted / 4) * 100) : 0}%
            </div>
            <div className="text-[10px] text-gray-500">تقدم الدورة</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
