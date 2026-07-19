import Link from "next/link";

export default function Hero() {
  return (
    <section id="home" className="min-h-screen bg-space-grid text-white flex items-center overflow-hidden relative">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-24 z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div>
            <span className="bg-blue-950/60 border border-blue-800/40 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold tracking-wider uppercase inline-block">
              Innovation & Cross-Disciplinary Collaboration Hub
            </span>

            <h1 className="text-6xl font-extrabold leading-tight mt-8 tracking-tight">
              Don't Let 
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
                {" "}Confusion{" "}
              </span>
              Stop You!
            </h1>

            <h2 className="text-4xl font-semibold mt-5 text-gray-300 tracking-wide">
              Turn Your Ideas Into Reality
            </h2>

            <p className="mt-8 text-lg text-gray-300 leading-8 max-w-xl font-normal">
              Yantriksha X Hub is a Student-Driven Innovation and
              Cross-Disciplinary Collaboration Hub designed to help
              students turn ideas into real-world products and startups.
              <br /><br />
              The hub brings together students from Engineering,
              Law, and Business to collaborate, innovate, and solve
              real-world challenges.
            </p>

            <div className="flex gap-5 mt-10">
              <Link href="/register">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-blue-900/40 border border-blue-500/20 transform hover:-translate-y-0.5">
                  Join Yantriksha
                </button>
              </Link>

              <button className="border border-slate-700 bg-slate-900/45 hover:bg-white hover:text-black hover:border-white px-8 py-4 rounded-xl font-semibold transition transform hover:-translate-y-0.5">
                Explore Journey
              </button>
            </div>
          </div>

          {/* Right Side - Three Transformation Stages */}
          <div>
            <div className="glass-card rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-[40px] pointer-events-none" />
              
              <h3 className="text-3xl font-extrabold mb-8 text-glow-blue tracking-tight">
                Three Transformation Stages
              </h3>

              <div className="space-y-6">

                {/* Stage -1 */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 hover:border-blue-500/35 transition-all duration-300 group">
                  <h4 className="text-xl font-bold text-blue-400 group-hover:text-blue-300 transition">
                    Stage -1 : Confusion
                  </h4>
                  <p className="text-gray-300 mt-2 text-sm leading-relaxed">
                    Helping students identify real-world problems,
                    discover opportunities, and build
                    cross-disciplinary teams.
                  </p>
                </div>

                {/* Stage 0 */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 hover:border-amber-500/30 transition-all duration-300 group">
                  <h4 className="text-xl font-bold text-amber-400 group-hover:text-amber-300 transition">
                    Stage 0 : Idea
                  </h4>
                  <p className="text-gray-300 mt-2 text-sm leading-relaxed">
                    Validate ideas, build prototypes, receive
                    mentorship, and evaluate technical, legal,
                    and business feasibility.
                  </p>
                </div>

                {/* Stage 1 */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 hover:border-emerald-500/30 transition-all duration-300 group">
                  <h4 className="text-xl font-bold text-emerald-400 group-hover:text-emerald-300 transition">
                    Stage 1 : Product
                  </h4>
                  <p className="text-gray-300 mt-2 text-sm leading-relaxed">
                    Convert prototypes into market-ready products
                    with startup support, funding, legal protection,
                    and commercialization.
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}