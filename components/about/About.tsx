const provisions = [
  { icon: "🚀", label: "Startup Incubation", desc: "Full legal and commercial launch support", color: "text-cyan-400", bg: "bg-cyan-950/30 border-cyan-900/40" },
  { icon: "🤝", label: "Cross-Disciplinary Teams", desc: "Engineering + Law + Business collaboration", color: "text-violet-400", bg: "bg-violet-950/30 border-violet-900/40" },
  { icon: "💰", label: "Seed Funding up to ₹50,000", desc: "Prototype fabrication reimbursement", color: "text-blue-400", bg: "bg-blue-950/30 border-blue-900/40" },
  { icon: "🎓", label: "Expert Mentorship", desc: "Faculty, industry coaches, and alumni", color: "text-amber-400", bg: "bg-amber-950/30 border-amber-900/40" },
  { icon: "🏆", label: "Innovation Challenges", desc: "Hackathons, ideathons, SIH, and more", color: "text-rose-400", bg: "bg-rose-950/30 border-rose-900/40" },
];

export default function About() {
  return (
    <section id="about" className="bg-slate-950 text-white py-28 relative overflow-hidden">

      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/4 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 z-10 relative">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* Left Block */}
          <div>
            <span className="section-pill">✦ About Us</span>

            <h2 className="text-5xl font-extrabold tracking-tight leading-tight">
              Building Future{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent">
                Innovators
              </span>
            </h2>

            <p className="mt-8 text-lg text-gray-300 leading-8 font-light">
              Yantriksha X Hub is a catalyst for technology startup formation.
              We empower students to take raw concepts, form multi-skilled teams,
              test product-market fit, and register corporate entities.
            </p>
            <p className="mt-4 text-lg text-gray-400 leading-8 font-light">
              Through deep connections with Vel Tech&apos;s engineering labs, law courses,
              and business administration mentorship, we support the translation of academic
              projects into high-growth startups.
            </p>

            {/* Decorative divider */}
            <div className="mt-10 h-px bg-gradient-to-r from-blue-500/40 via-indigo-500/20 to-transparent" />

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { val: "100+", label: "Projects Completed" },
                { val: "250+", label: "Ideas Validated" },
                { val: "30+", label: "Industry Partners" },
                { val: "3", label: "Transformation Stages" },
              ].map(({ val, label }) => (
                <div key={label} className="glass-card rounded-xl p-4 text-center border border-slate-800/60">
                  <div className="text-3xl font-extrabold text-blue-400">{val}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Block */}
          <div className="glass-card rounded-3xl p-8 shadow-xl border border-slate-800/60 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

            <h3 className="text-2xl font-extrabold mb-7 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
              What We Provide
            </h3>

            <ul className="space-y-4">
              {provisions.map(({ icon, label, desc, color, bg }) => (
                <li
                  key={label}
                  className={`group flex items-start gap-4 p-4 rounded-xl border ${bg} transition-all duration-200 hover:-translate-x-0.5`}
                >
                  <span className="text-2xl mt-0.5 shrink-0">{icon}</span>
                  <div>
                    <p className={`font-semibold text-sm ${color}`}>{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}