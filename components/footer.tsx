import Link from "next/link"

const footerLinks: { href: string; label: string }[] = [
  // { href: "/privacy", label: "PRIVACY POLICY" },
  // { href: "/terms", label: "TERMS OF SERVICE" },
  // { href: "/admissions", label: "ADMISSIONS" },
  // { href: "/alumni", label: "ALUMNI" },
  // { href: "/support", label: "SUPPORT" },
]

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-black w-full border-t border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-7xl mx-auto">
        <Link href="/" className="text-lg font-black text-white mb-6 md:mb-0">
          Trailblazers Academy
        </Link>
        <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-['Inter'] text-xs uppercase tracking-wider text-slate-400 hover:text-orange-400 hover:underline transition-all opacity-80 hover:opacity-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="text-slate-400 font-['Inter'] text-xs">
          © {new Date().getFullYear()} Trailblazers Academy. Empowering Future Leaders.
        </div>
      </div>
    </footer>
  )
}
