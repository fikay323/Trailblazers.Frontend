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
    <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-3 shadow-md border-b border-orange-500/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex flex-1 items-center justify-center sm:justify-start gap-3 text-center sm:text-left flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-200" />
            {status.badge}
          </span>
          <p className="text-xs sm:text-sm font-medium">
            <span className="font-semibold text-amber-100">Intensive Summer Coaching 2026</span> — {status.subText}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/summer-coaching">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white text-orange-700 hover:bg-amber-50 px-4 py-1.5 text-xs sm:text-sm font-bold transition-all duration-200 shadow-sm cursor-pointer hover:scale-105">
              <span>View Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <button
            onClick={() => setIsVisible(false)}
            className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss banner"
            title="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
