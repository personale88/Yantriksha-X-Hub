const stages = [
  {
    id: "Stage -1",
    name: "Confusion",
    icon: "🤔",
    desc: "Discover real-world pain points through literature surveys and patent research. Build a compliant, cross-disciplinary 10-member team of Engineering, Law, and Business students led by a Faculty Advisor.",
    accent: "from-red-500 to-rose-700",
    border: "hover:border-red-500/40 hover:shadow-red-900/10",
    badge: "bg-red-950/40 text-red-400 border-red-900/50",
    glow: "from-red-500/10 to-transparent",
    number: "01",
  },
  {
    id: "Stage 0",
    name: "Idea",
    icon: "💡",
    desc: "Refine your value proposition through user surveys and market research. Build engineering blueprints, prototype designs, and evaluate feasibility across technical, legal, and commercial pillars.",
    accent: "from-amber-400 to-yellow-600",
    border: "hover:border-amber-500/40 hover:shadow-amber-900/10",
    badge: "bg-amber-950/40 text-amber-400 border-amber-900/50",
    glow: "from-amber-500/10 to-transparent",
    number: "02",
  },
  {
    id: "Stage 1",
    name: "Product",
    icon: "🚀",
    desc: "Transform prototypes into market-ready startups. Access seed funding (up to ₹50,000), mentorship, sandbox testing, hackathon participation, IPR support, investor pitching, and full company launch.",
    accent: "from-emerald-500 to-green-700",
    border: "hover:border-emerald-500/40 hover:shadow-emerald-900/10",
    badge: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    glow: "from-emerald-500/10 to-transparent",
    number: "03",
  },
];

export default function Stages() {
  return (
    <section className="bg-slate-900/50 text-white py-16 relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="section-pill">✦ Student Journey</span>

          <h2 className="fluid-h2 font-extrabold tracking-tight leading-tight">
            Three{" "}
            <span className="bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
              Transformation
            </span>{" "}
            Stages
          </h2>

          <p className="mt-6 fluid-p text-gray-400 max-w-2xl mx-auto">
            Every student progresses through a structured journey from identifying a
            problem to launching a market-ready startup.
          </p>
        </div>

        {/* Stage Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={`group relative glass-card rounded-2xl p-8 border border-slate-800/60 shadow-lg transition-all duration-300 ${stage.border} hover:shadow-xl overflow-hidden`}
            >
              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stage.accent} rounded-t-2xl`} />

              {/* Background gradient reveal on hover */}
              <div className={`absolute inset-0 bg-gradient-to-b ${stage.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              {/* Step number */}
              <div className="relative flex items-center gap-3 mb-6">
                <span className="text-4xl">{stage.icon}</span>
                <span className="ml-auto text-5xl font-black text-slate-800/50 select-none">
                  {stage.number}
                </span>
              </div>

              {/* Stage badge */}
              <span className={`relative inline-flex text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-3 ${stage.badge}`}>
                {stage.id}
              </span>

              {/* Title */}
              <h3 className="relative text-2xl font-extrabold text-white mt-1 mb-4 tracking-tight">
                {stage.name}
              </h3>

              {/* Description */}
              <p className="relative text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}