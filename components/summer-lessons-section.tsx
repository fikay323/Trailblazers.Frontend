"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, MapPin, ArrowRight, BookOpen, Monitor, GraduationCap, Sparkles, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSummerStatus, SummerStatus } from "@/lib/summer-coaching-utils"

export function SummerLessonsSection() {
  const [status, setStatus] = useState<SummerStatus>(() => getSummerStatus())

  useEffect(() => {
    setStatus(getSummerStatus())
  }, [])

  const features = [
    {
      title: "Junior Secondary (JSS 1 - JSS 3)",
      description: "Solid foundation in Mathematics, Basic Science, English, & ICT. Preparing students for upper classes with confidence.",
      icon: BookOpen,
      badge: "Foundation Level"
    },
    {
      title: "Senior Secondary (SS 1 - SS 3)",
      description: "Intensive subject coaching across Sciences, Arts, & Commercial tracks (Maths, Physics, Chemistry, Biology, Economics, Govt, etc.).",
      icon: GraduationCap,
      badge: "SSCE Prep"
    },
    {
      title: "JAMB / UTME 2027 Headstart",
      description: "Early syllabus coverage, past questions analysis, speed techniques, and strategic exam guidance for future university candidates.",
      icon: Sparkles,
      badge: "University Track"
    },
    {
      title: "Practical CBT & Computer Literacy",
      description: "Hands-on exposure in our dedicated CBT laboratory. Build speed, accuracy, and digital confidence early.",
      icon: Monitor,
      badge: "Hands-on Lab"
    }
  ]

  return (
    <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-24 text-white">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-400">
            <Calendar className="h-3.5 w-3.5 animate-bounce" />
            {status.heroTag}
          </span>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
            Trailblazer Intensive <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">Summer Coaching 2026</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Give your child a massive academic advantage this holiday! Join our high-impact holiday preparatory classes designed to boost performance, master key subjects, and build CBT confidence.
          </p>
        </div>

        {/* Info Pill Badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs sm:text-sm font-semibold text-slate-200">
          <div className="flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 border border-slate-700">
            <Clock className="h-4 w-4 text-orange-400" />
            <span>Morning & Afternoon Sessions</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 border border-slate-700">
            <MapPin className="h-4 w-4 text-orange-400" />
            <span>Opp. Ajorosun Garden City, Ijaye-Iseyin Road, Odo Oba Moniya, Ibadan</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 border border-slate-700">
            <UserCheck className="h-4 w-4 text-orange-400" />
            <span>Expert & Dedicated Tutors</span>
          </div>
        </div>

        {/* 4 Feature Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-800/50 p-6 backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:bg-slate-800 hover:shadow-xl hover:shadow-orange-500/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-md bg-slate-700/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
                  <span>Learn curriculum details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Dynamic CTA Bar */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left shadow-2xl">
          <div>
            <h3 className="text-xl font-bold text-white sm:text-2xl">
              {status.ctaBannerTitle}
            </h3>
            <p className="mt-1 text-sm text-orange-100">
              {status.ctaBannerSub}
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:mt-0 shrink-0">
            <Link href="/summer-coaching">
              <Button className="w-full sm:w-auto bg-white text-orange-700 hover:bg-slate-100 font-bold px-6 py-3 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105">
                Full Summer Timetable
              </Button>
            </Link>

            <Link href="/register">
              <Button className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-950 font-bold px-6 py-3 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105">
                Register Immediately
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
