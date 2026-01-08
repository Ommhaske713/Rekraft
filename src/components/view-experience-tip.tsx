'use client'

import { useState, useEffect } from 'react'
import { X, Zap } from 'lucide-react'

export default function ViewExperienceTip() {
  const [isVisible, setIsVisible] = useState(false)
  const [showOnLarge, setShowOnLarge] = useState(false)

  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.innerHTML = `
      @keyframes rekrafttGlow {
        0% { box-shadow: 0 0 18px rgba(34, 197, 94, 0.55); border-color: rgba(34, 197, 94, 0.6); }
        25% { box-shadow: 0 0 18px rgba(16, 185, 129, 0.75); border-color: rgba(16, 185, 129, 0.85); }
        50% { box-shadow: 0 0 18px rgba(59, 130, 246, 0.55); border-color: rgba(59, 130, 246, 0.65); }
        75% { box-shadow: 0 0 18px rgba(37, 99, 235, 0.7); border-color: rgba(37, 99, 235, 0.8); }
        100% { box-shadow: 0 0 18px rgba(34, 197, 94, 0.55); border-color: rgba(34, 197, 94, 0.6); }
      }
    `
    document.head.appendChild(styleElement)
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    const checkViewportSize = () => {
      const isDesktop = window.innerWidth >= 1024
      setShowOnLarge(isDesktop)

      if (isDesktop) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => setIsVisible(true), 2500)
      } else {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }
        setIsVisible(false)
      }
    }

    checkViewportSize()
    window.addEventListener('resize', checkViewportSize)

    return () => {
      window.removeEventListener('resize', checkViewportSize)
      if (timer) clearTimeout(timer)
    }
  }, [])

  if (!isVisible || !showOnLarge) {
    return null
  }

  return (
    <div
      className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 max-w-[34rem] w-[85vw] sm:w-[70vw] lg:w-[60vw] rounded-2xl border bg-white/90 dark:bg-gray-900/90 px-5 py-3.5 text-sm text-gray-900 dark:text-gray-100 shadow-2xl backdrop-blur-xl flex items-center gap-4"
      style={{ animation: 'rekrafttGlow 7s infinite linear' }}
    >
      <div className="h-9 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shadow-md">
        <Zap className="h-4 w-4 text-emerald-600" />
      </div>
      <div className="flex-1 leading-tight">
        <p className="font-semibold text-emerald-700 dark:text-emerald-200">Best viewed at 75% zoom</p>
        <p className="text-[13px] sm:text-sm text-gray-800 dark:text-gray-100/90">
          Use <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-900/60 text-[11px] font-semibold text-gray-800 dark:text-gray-100">Ctrl -</kbd> or <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-900/60 text-[11px] font-semibold text-gray-800 dark:text-gray-100">⌘ -</kbd> to set your browser zoom to 75% for the cleanest layout.
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-gray-500 hover:text-gray-800 dark:text-emerald-200 dark:hover:text-white transition-colors"
        aria-label="Close tip"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
