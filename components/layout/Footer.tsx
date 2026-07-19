import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Roadmap", href: "/#roadmap" },
  { label: "Events", href: "/#events" },
];

const socials = [
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Twitter / X", href: "#" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 text-gray-400 relative overflow-hidden border-t border-slate-800/60">

      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">

        {/* Top row */}
        <div className="grid md:grid-cols-3 gap-12 pb-12 border-b border-slate-800/60">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-700/50 group-hover:border-blue-500/50 transition">
                <Image src="/logo.jpg" alt="Yantriksha X Hub" fill className="object-cover" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Yantriksha X Hub
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-gray-500">
              A student-driven Innovation &amp; Cross-Disciplinary Collaboration Hub transforming ideas into impactful startups.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-950/40 border border-blue-900/40 text-blue-400 font-semibold">Innovation</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-900/40 text-amber-400 font-semibold">Startups</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 font-semibold">Collaboration</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-200 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Socials */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Connect</h4>
            <ul className="space-y-3">
              {socials.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-200 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link href="/register">
                <button className="w-full text-sm font-semibold bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white px-4 py-2.5 rounded-lg transition-all duration-300">
                  Join Yantriksha X Hub →
                </button>
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© 2026 Yantriksha X Hub. All Rights Reserved.</p>
          <p className="text-gray-700">Built with ♥ at Vel Tech University</p>
        </div>

      </div>
    </footer>
  );
}