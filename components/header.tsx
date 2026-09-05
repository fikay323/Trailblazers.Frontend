"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, GraduationCap, ShieldCheck, LogIn, LogOut, User } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { useAuth } from "@/core/contexts/AuthContext"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/summer-coaching", label: "Summer Lessons", badge: "NEW" },
  { href: "/programs", label: "Programs" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isPortal = user && (user.role === 'Admin' || user.role === 'Instructor')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link href="/" className="text-lg font-bold text-foreground flex items-center gap-2.5">
          <Image
            className="dark:invert rounded-full"
            src="/trailblazer.jpeg"
            alt="Trailblazer Academy & Edukonsult"
            width={40}
            height={40}
          />
          <span className="hidden sm:inline text-base font-extrabold tracking-tight">
            Trailblazer Academy
          </span>
          <span className="sm:hidden text-base font-extrabold">Trailblazer</span>
        </Link>

        {/* Desktop Navigation Links (CBT Exam removed) */}
        <nav className="hidden items-center gap-5 lg:gap-7 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 py-1 ${isActive
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-orange-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-2xs">
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Authentication / Action Area */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Authenticated User Pill */}
              {isPortal ? (
                <Link
                  href="/admin/submissions"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-all shadow-sm"
                >
                  <div className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <span>Admin Portal</span>
                </Link>
              ) : (
                <Link
                  href="/student/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-950/40 hover:bg-orange-950/70 border border-orange-800/60 text-xs font-semibold text-orange-200 transition-all shadow-sm"
                >
                  <div className="h-6 w-6 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {user.fullName?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <span className="max-w-[120px] truncate">{user.fullName || "Dashboard"}</span>
                  <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-950 px-1.5 py-0.5 rounded border border-orange-800/80">
                    Student
                  </span>
                </Link>
              )}

              {/* Explicit Sign Out Button */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-slate-800/50 transition-colors cursor-pointer"
                title="Sign out of your account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            /* Logged-Out Guest State */
            <div className="flex items-center gap-2.5">
              <Link
                href="/auth/login"
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-md hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5 text-orange-500" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors shadow-sm cursor-pointer"
              >
                Register Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-slate-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden bg-background/98 p-4 space-y-4 shadow-xl">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center justify-between py-2 px-1 ${pathname === link.href ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-2xs">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-border space-y-2">
            {user ? (
              <div className="space-y-2">
                <div className="px-2 py-1 text-xs text-slate-400">
                  Signed in as <strong className="text-white">{user.fullName}</strong> ({user.email})
                </div>
                {isPortal ? (
                  <Link
                    href="/admin/submissions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-md bg-slate-800 text-white w-full"
                  >
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <span>Admin Management Portal</span>
                  </Link>
                ) : (
                  <Link
                    href="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-md bg-orange-950 text-orange-200 border border-orange-800 w-full"
                  >
                    <GraduationCap className="h-4 w-4 text-orange-400" />
                    <span>My Student Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 w-full px-4 py-2 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center text-sm font-semibold text-slate-200 py-2 border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center text-sm font-bold py-2.5 rounded-md transition-colors"
                >
                  Register Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
