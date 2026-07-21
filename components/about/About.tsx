const provisions = [
  { icon: "🚀", label: "Startup Incubation", desc: "Full legal and commercial launch support", color: "text-cyan-400", bg: "bg-cyan-950/30 border-cyan-900/40" },
  { icon: "🤝", label: "Cross-Disciplinary Teams", desc: "Engineering + Law + Business collaboration", color: "text-violet-400", bg: "bg-violet-950/30 border-violet-900/40" },
  { icon: "💰", label: "Seed Funding up to ₹50,000", desc: "Prototype fabrication reimbursement", color: "text-blue-400", bg: "bg-blue-950/30 border-blue-900/40" },
  { icon: "🎓", label: "Expert Mentorship", desc: "Faculty, industry coaches, and alumni", color: "text-amber-400", bg: "bg-amber-950/30 border-amber-900/40" },
  { icon: "🏆", label: "Innovation Challenges", desc: "Hackathons, ideathons, SIH, and more", color: "text-rose-400", bg: "bg-rose-950/30 border-rose-900/40" },
];

export default function About() {
  return (
    <section id="about" className="bg-slate-950 text-white py-16 relative overflow-hidden">

      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/4 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 z-10 relative">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* Left Block */}
          <div>
            <span className="section-pill">✦ About Us</span>

            <h2 className="fluid-h2 font-extrabold tracking-tight leading-tight">
              Building Future{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent">
                Innovators
              </span>
            </h2>

            <p className="mt-8 fluid-p text-gray-300 font-light">
              Yantriksha_X_Hub is a catalyst for technology startup formation.
              We empower students to take raw concepts, form multi-skilled teams,
              test product-market fit, and register corporate entities.
            </p>
            <p className="mt-4 fluid-p text-gray-400 font-light">
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

        {/* Meaning of YantrikshaX Hub Section */}
        <div className="mt-10 border-t border-slate-900/60 pt-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="section-pill inline-block">✦ Decoding YantrikshaXHub</span>
            <h3 className="text-3xl font-extrabold text-white mt-4 tracking-tight">
              The Meaning of{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent">
                YantrikshaX Hub
              </span>
            </h3>
            <p className="text-gray-400 text-sm mt-3 font-light">
              Our name represents the perfect fusion of technical capability, limitless vision, and collaborative synergy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                term: "Yantra (यंत्र)",
                definition: "Refers to machines, technology, and engineering, symbolizing the foundation of innovation and technical expertise.",
                icon: "⚙️",
                border: "hover:border-blue-500/40"
              },
              {
                term: "Antariksha (अंतरिक्ष)",
                definition: "Represents space and limitless possibilities, signifying exploration, creativity, and the universe of ideas.",
                icon: "🌌",
                border: "hover:border-indigo-500/40"
              },
              {
                term: "X",
                definition: "Denotes cross-disciplinary collaboration, where diverse fields like Engineering (CSE, ECE, EEE, MECH, CIVIL, AERO), Management, and Law converge to spark innovation.",
                icon: "✖️",
                border: "hover:border-amber-500/40"
              },
              {
                term: "Hub",
                definition: "Refers to a central place or nexus for collaboration, knowledge exchange, and innovation, where people come together to brainstorm, create, and bring ideas to life.",
                icon: "🔌",
                border: "hover:border-rose-500/40"
              }
            ].map(({ term, definition, icon, border }) => (
              <div 
                key={term} 
                className={`glass-card rounded-2xl p-6 border border-slate-800/60 transition-all duration-300 hover:-translate-y-1 ${border} flex flex-col justify-between`}
              >
                <div>
                  <span className="text-3xl mb-4 block">{icon}</span>
                  <h4 className="text-lg font-bold text-white mb-2">{term}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed font-light">{definition}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Meaning Callout */}
          <div className="mt-10 glass-card rounded-3xl p-8 border border-slate-800/60 relative overflow-hidden bg-gradient-to-br from-slate-900/50 via-slate-900/30 to-slate-950/80">
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 grid md:grid-cols-5 gap-8 items-center">
              <div className="md:col-span-2">
                <span className="text-xs font-black uppercase text-amber-400 tracking-widest block mb-2">Overall Vision</span>
                <p className="text-base text-gray-200 font-medium leading-relaxed">
                  &ldquo;YantrikshaX Hub&rdquo; is a dynamic space that fosters collaboration, blending technology (Yantra) and limitless exploration (Antariksha) through cross-disciplinary efforts (X).
                </p>
              </div>
              <div className="hidden md:block md:col-span-1 text-center">
                <span className="text-4xl text-slate-800 font-extrabold select-none">❯</span>
              </div>
              <div className="md:col-span-2 text-gray-300 text-xs leading-relaxed font-light space-y-4">
                <p>
                  It serves as a center of innovation, where diverse knowledge from multiple fields converges to create groundbreaking solutions for the future.
                </p>
                <p>
                  Yantriksha X Hub is a student-driven innovation platform designed to help aspiring innovators navigate the journey from confusion to product development. It fosters interdisciplinary collaboration, knowledge sharing, and mentorship from industry experts, enabling students to solve real-world and industrial problems. By providing structured team dynamics, exposure to competitions, research opportunities, and networking events, Yantriksha X Hub empowers students to transform ideas into impactful solutions, startups, and businesses.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}