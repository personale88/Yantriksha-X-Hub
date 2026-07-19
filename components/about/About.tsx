export default function About() {
  return (
    <section id="about" className="bg-slate-950 text-white py-28 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 z-10 relative">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left Block */}
          <div>
            <span className="text-amber-500 font-extrabold tracking-widest text-sm uppercase block">
              ABOUT US
            </span>

            <h2 className="text-5xl font-extrabold mt-4 tracking-tight leading-tight">
              Building Future 
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                {" "}Innovators
              </span>
            </h2>

            <p className="mt-8 text-lg text-gray-300 leading-8 font-light">
              Yantriksha X Hub is a catalyst for technology startup formation. 
              We empower students to take raw concepts, form multi-skilled groups, 
              test product market fit, and register corporate entities. 
              <br /><br />
              Through deep connections with Vel Tech's engineering labs, law courses, 
              and business administration mentorship, we support the translation of academic projects 
              into high-growth startups.
            </p>
          </div>

          {/* Right Block - Glassmorphic Checklist */}
          <div className="glass-card rounded-3xl p-10 shadow-xl border border-slate-800">
            <h3 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
              What We Provide
            </h3>

            <ul className="space-y-6">
              <li className="flex items-center gap-4 text-gray-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/40 text-blue-400 font-bold border border-blue-800/40 shadow-sm">
                  ✓
                </span>
                <span className="font-medium">🚀 Startup Incubation</span>
              </li>
              <li className="flex items-center gap-4 text-gray-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/40 text-blue-400 font-bold border border-blue-800/40 shadow-sm">
                  ✓
                </span>
                <span className="font-medium">🤝 Cross-Disciplinary Teams</span>
              </li>
              <li className="flex items-center gap-4 text-gray-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/40 text-blue-400 font-bold border border-blue-800/40 shadow-sm">
                  ✓
                </span>
                <span className="font-medium">💰 Seed Funding (up to ₹50,000)</span>
              </li>
              <li className="flex items-center gap-4 text-gray-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/40 text-blue-400 font-bold border border-blue-800/40 shadow-sm">
                  ✓
                </span>
                <span className="font-medium">👨‍🏫 Expert Mentorship</span>
              </li>
              <li className="flex items-center gap-4 text-gray-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/40 text-blue-400 font-bold border border-blue-800/40 shadow-sm">
                  ✓
                </span>
                <span className="font-medium">🏆 Innovation Challenges</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}