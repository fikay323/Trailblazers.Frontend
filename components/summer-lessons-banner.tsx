"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, ArrowRight, X } from "lucide-react"
import { getSummerStatus, SummerStatus } from "@/lib/summer-coaching-utils"

export function SummerLessonsBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [status, setStatus] = useState<SummerStatus>(() => getSummerStatus())

  useEffect(() => {
    setStatus(getSummerStatus())
  }, [])

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-3 py-2.5 sm:px-4 sm:py-3 shadow-md border-b border-orange-500/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2.5 sm:gap-4">
        {/* Main Info Wrapper */}
        <div className="flex flex-1 items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-xs shrink-0">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse text-amber-200" />
            <span>{status.badge}</span>
          </span>

          <p className="text-xs sm:text-sm font-medium leading-tight text-amber-50">
            <span className="font-bold text-white">Summer Coaching 2026</span>
            <span className="hidden sm:inline"> — {status.subText}</span>
            <span className="inline sm:hidden"> — Classes for JSS1–SS3, JAMB & CBT prep.</span>
          </p>
        </div>

        {/* Action & Close Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/summer-coaching">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg bg-white text-orange-700 hover:bg-amber-50 px-2.5 py-1 sm:px-4 sm:py-1.5 text-xs font-bold transition-all duration-200 shadow-sm cursor-pointer hover:scale-105 whitespace-nowrap">
              <span>View Details</span>
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </span>
          </Link>

          <button
            onClick={() => setIsVisible(false)}
            className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss banner"
            title="Dismiss banner"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
