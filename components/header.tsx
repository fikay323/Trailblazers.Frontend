"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/programs", label: "Programs" },
  { href: "/gallery", label: "Gallery" },
  { href: "/exam", label: "CBT Exam" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-foreground flex items-center gap-2">
          <Image className="dark:invert" src="/trailblazers.jpeg" alt="Trailblazers Academy & Edukonsult" width={50} height={50} />
          <span>Trailblazers Academy & Edukonsult</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium hover:text-primary transition-transform duration-200 ${pathname === link.href ? "text-primary font-bold border-b-2 border-primary" : "text-slate-600 dark:text-slate-400"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link href="/register">
            <button className="bg-primary-container cursor-pointer text-white hover:bg-orange-600 font-label-md text-label-md px-6 py-2.5 rounded-DEFAULT transition-colors shadow-[0_2px_8px_rgba(11,28,48,0.12)]">
              Register Now
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden">
          <nav className="flex flex-col gap-4 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <Link href="/register">
              <button className="mt-2 w-full bg-primary-container cursor-pointer text-white hover:bg-orange-600 font-label-md text-label-md px-6 py-2.5 rounded-DEFAULT transition-colors shadow-[0_2px_8px_rgba(11,28,48,0.12)]">
                Register Now
              </button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
