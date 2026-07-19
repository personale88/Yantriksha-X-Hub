import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="navbar-glass w-full fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-slate-700/50 group-hover:border-blue-500/60 transition-all duration-300 shadow-sm group-hover:shadow-blue-900/30">
            <Image
              src="/logo.png"
              alt="Yantriksha_X_Hub Logo"
              fill
              className="object-contain"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
          <span className="text-lg font-bold flex items-center">
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Yantriksha</span>
            <span className="inline-block relative h-7 w-9 mx-0.5 align-middle shrink-0">
              <Image src="/logo.png" fill className="object-contain" style={{ mixBlendMode: 'screen' }} alt="X" />
            </span>
            <span className="bg-gradient-to-r from-indigo-300 to-amber-300 bg-clip-text text-transparent">Hub</span>
          </span>
        </Link>

        {/* Menu */}
        <ul className="hidden md:flex items-center gap-8">
          {[
            { label: "Home", href: "/#home" },
            { label: "About", href: "/#about" },
            { label: "Roadmap", href: "/#roadmap" },
            { label: "Events", href: "/#events" },
            { label: "Core Team", href: "/team" },
            { label: "Contact", href: "/#contact" },
          ].map(({ label, href }) => (
            <li key={label}>
              <Link href={href} className="nav-link">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link href="/login">
          <button className="relative overflow-hidden group bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 shadow-lg shadow-blue-900/30 border border-blue-500/30 hover:shadow-blue-700/40 hover:-translate-y-0.5">
            <span className="relative z-10">Login →</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </Link>

      </div>
    </nav>
  );
}