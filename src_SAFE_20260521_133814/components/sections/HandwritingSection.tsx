'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { vocabulary } from '@/data/vocabulary'
import { speak } from '@/lib/helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Volume2, PenTool, Undo2, Eraser, Grid3X3, Shuffle, SkipForward, Paintbrush } from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// HANDWRITING SECTION
// ═══════════════════════════════════════════════════════════
export function HandwritingSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentChar, setCurrentChar] = useState(vocabulary[0])
  const [strokeCount, setStrokeCount] = useState(0)
  const [showGuide, setShowGuide] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [charIndex, setCharIndex] = useState(0)
  const [brushSize, setBrushSize] = useState(6)
  const [brushColor, setBrushColor] = useState('#1a1a1a')
  const undoStack = useRef<ImageData[]>([])

  const getCanvasContext = useCallback((): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }, [])

  const getPointerPos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const saveState = useCallback(() => {
    const ctx = getCanvasContext()
    if (!ctx) return
    const canvas = canvasRef.current
    if (!canvas) return
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    if (undoStack.current.length > 50) undoStack.current.shift()
  }, [getCanvasContext])

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const w = canvas.width
    const h = canvas.height
    ctx.save()
    ctx.strokeStyle = '#d1d5db' // gray-300
    ctx.lineWidth = 0.5
    ctx.setLineDash([6, 4])
    // Vertical center line
    ctx.beginPath()
    ctx.moveTo(w / 2, 0)
    ctx.lineTo(w / 2, h)
    ctx.stroke()
    // Horizontal center line
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()
    // Diagonal lines
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(w, h)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(w, 0)
    ctx.lineTo(0, h)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }, [])

  const redrawCanvas = useCallback(() => {
    const ctx = getCanvasContext()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (showGrid) drawGrid(ctx, canvas)
  }, [getCanvasContext, showGrid, drawGrid])

  useEffect(() => {
    const ctx = getCanvasContext()
    if (!ctx) return
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const canvas = canvasRef.current
    if (canvas && showGrid) drawGrid(ctx, canvas)
  }, [getCanvasContext, showGrid, drawGrid])

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const ctx = getCanvasContext()
    if (!ctx) return
    if ('touches' in e) e.preventDefault()
    setIsDrawing(true)
    saveState()
    const pos = getPointerPos(e)
    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }, [getCanvasContext, getPointerPos, saveState, brushColor, brushSize])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const ctx = getCanvasContext()
    if (!ctx) return
    if ('touches' in e) e.preventDefault()
    const pos = getPointerPos(e)
    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }, [isDrawing, getCanvasContext, getPointerPos, brushColor, brushSize])

  const stopDrawing = useCallback(() => {
    if (isDrawing) setStrokeCount(s => s + 1)
    setIsDrawing(false)
  }, [isDrawing])

  const clearCanvas = useCallback(() => {
    const ctx = getCanvasContext()
    if (!ctx) return
    const canvas = canvasRef.current
    if (!canvas) return
    saveState()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (showGrid) drawGrid(ctx, canvas)
    setStrokeCount(0)
  }, [getCanvasContext, saveState, showGrid, drawGrid])

  const undoStroke = useCallback(() => {
    const ctx = getCanvasContext()
    if (!ctx) return
    if (undoStack.current.length === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const prevState = undoStack.current.pop()!
    ctx.putImageData(prevState, 0, 0)
    setStrokeCount(s => Math.max(0, s - 1))
  }, [getCanvasContext])

  const nextChar = useCallback(() => {
    clearCanvas()
    const idx = (charIndex + 1) % Math.min(50, vocabulary.length)
    setCharIndex(idx)
    setCurrentChar(vocabulary[idx])
    undoStack.current = []
  }, [charIndex, clearCanvas])

  const randomChar = useCallback(() => {
    clearCanvas()
    const idx = Math.floor(Math.random() * Math.min(50, vocabulary.length))
    setCharIndex(idx)
    setCurrentChar(vocabulary[idx])
    undoStack.current = []
  }, [clearCanvas])

  const commonChars = vocabulary.slice(0, 50).map(w => w.zh)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <PenTool className="w-6 h-6 text-red-600" />
          الكتابة اليدوية
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full mt-2" />
      </div>
      {/* Character Display + Canvas */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Left: Character Info */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <button onClick={() => speak(currentChar.zh)} className="group block mx-auto mb-3">
                <div className="font-chinese-serif text-7xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-red-600 transition-colors drop-shadow-sm">
                  {currentChar.zh}
                </div>
              </button>
              <div className="font-chinese-sans text-xl text-gray-500 dark:text-gray-400 mb-2">{currentChar.pinyin}</div>
              <div className="text-lg font-bold text-red-600 mb-1">{currentChar.meaning}</div>
              {currentChar.mnemonic && (
                <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-1.5 mt-2">💡 {currentChar.mnemonic}</div>
              )}
            </CardContent>
          </Card>
          {/* Quick Select */}
          <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اختر حرفاً:</h3>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {commonChars.map((char, i) => (
                  <button
                    key={i}
                    onClick={() => { clearCanvas(); setCharIndex(i); setCurrentChar(vocabulary[i]); undoStack.current = [] }}
                    className={`px-2.5 py-1.5 rounded-lg text-sm font-chinese-serif transition-all ${
                      i === charIndex
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-red-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-red-900/30'
                    }`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Stroke Count */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">عدد الخطوط:</span>
            <Badge variant="secondary" className="font-bold">{strokeCount}</Badge>
          </div>
        </div>
        {/* Right: Canvas */}
        <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 space-y-3">
            {/* Canvas Tools — grouped */}
            <div className="flex flex-col gap-2">
              {/* Row 1: Actions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={clearCanvas}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  مسح
                </button>
                <button
                  onClick={undoStroke}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  تراجع
                </button>
                <button
                  onClick={() => setShowGuide(g => !g)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${showGuide ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  {showGuide ? 'إخفاء الدليل' : 'إظهار الدليل'}
                </button>
                <button
                  onClick={() => { setShowGrid(g => !g); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${showGrid ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  {showGrid ? 'إخفاء الشبكة' : 'إظهار الشبكة'}
                </button>
              </div>
              {/* Row 2: Navigation */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={nextChar}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  التالي
                </button>
                <button
                  onClick={randomChar}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  عشوائي
                </button>
              </div>
            </div>
            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">حجم الفرشاة:</span>
              {[3, 6, 10, 14].map(size => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  className={`rounded-full transition-all ${brushSize === size ? 'ring-2 ring-red-400 bg-red-100 dark:bg-red-900/40' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500'}`}
                  style={{ width: size + 12, height: size + 12 }}
                />
              ))}
            </div>
            {/* Canvas */}
            <div className="relative bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Guide Character */}
              {showGuide && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 dark:opacity-20">
                  <span className="font-chinese-serif text-[200px] text-gray-300 dark:text-gray-600 select-none">{currentChar.zh}</span>
                </div>
              )}
              {/* Grid Overlay */}
              {showGrid && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" className="text-gray-300 dark:text-gray-600" strokeWidth="0.5" strokeDasharray="6 4" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" className="text-gray-300 dark:text-gray-600" strokeWidth="0.5" strokeDasharray="6 4" />
                  <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="0.3" strokeDasharray="6 4" />
                  <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="0.3" strokeDasharray="6 4" />
                </svg>
              )}
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ aspectRatio: '1/1' }}
              />
            </div>
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">{charIndex + 1} / {commonChars.length}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => speak(currentChar.zh)} className="gap-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  نطق
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
