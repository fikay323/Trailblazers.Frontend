import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-black w-full border-t border-slate-800 text-slate-400">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 py-10 w-full max-w-7xl mx-auto gap-6">
        <div>
          <Link href="/" className="text-lg font-extrabold text-white">
            Trailblazer Academy & Edukonsult
          </Link>
          <p className="mt-1 text-xs text-slate-400">
            Opp. Ajorosun Garden City, Ijaye-Iseyin Road, Odo Oba Moniya, Ibadan
          </p>
        </div>

        {/* Social Media & Quick Links */}
        <div className="flex items-center gap-6 text-xs font-semibold">
          <a
            href="https://www.facebook.com/TrailblazerEdukonsult"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-400 transition-colors"
          >
            Facebook Page
          </a>
          <a
            href="https://www.instagram.com/trailblazeredukonsult"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-400 transition-colors"
          >
            Instagram Profile
          </a>
          <a
            href="https://wa.me/2348165999425"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors"
          >
            WhatsApp Support
          </a>
        </div>

        <div className="text-xs text-slate-400 text-center md:text-right">
          © {new Date().getFullYear()} Trailblazer Academy & Edukonsult. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
