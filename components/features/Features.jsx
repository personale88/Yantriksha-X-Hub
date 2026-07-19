const features = [
  {
    title: "Seed Funding",
    description:
      "Receive up to ₹50,000 in prototype fabrication reimbursement. Compliant cross-disciplinary teams can apply through the hub portal once their resource request is approved by a mentor.",
    icon: "💰",
    accent: "from-blue-500/20 to-blue-600/5",
    border: "hover:border-blue-500/50",
    glow: "hover:shadow-blue-900/20",
    badge: "bg-blue-500/10 border-blue-500/30",
    tag: "Financial Support",
    tagColor: "text-blue-400",
  },
  {
    title: "Expert Mentorship",
    description:
      "Get matched with faculty advisors, startup coaches, and industry professionals for regular one-on-one guidance on design, business modeling, and legal compliance.",
    icon: "🎓",
    accent: "from-amber-500/20 to-amber-600/5",
    border: "hover:border-amber-500/50",
    glow: "hover:shadow-amber-900/20",
    badge: "bg-amber-500/10 border-amber-500/30",
    tag: "Expert Guidance",
    tagColor: "text-amber-400",
  },
  {
    title: "Cross-Disciplinary Teams",
    description:
      "Collaborate with exactly 10 peers from Engineering, Law, and Business disciplines. This diverse structure ensures your startup is technically sound, legally compliant, and market-ready.",
    icon: "🤝",
    accent: "from-violet-500/20 to-violet-600/5",
    border: "hover:border-violet-500/50",
    glow: "hover:shadow-violet-900/20",
    badge: "bg-violet-500/10 border-violet-500/30",
    tag: "Team Formation",
    tagColor: "text-violet-400",
  },
  {
    title: "Innovation Challenges",
    description:
      "Compete in collegiate hackathons, internal ideathons, and national events like Smart India Hackathon. Win prizes, build network, and validate your prototype in real-world competitive scenarios.",
    icon: "🏆",
    accent: "from-rose-500/20 to-rose-600/5",
    border: "hover:border-rose-500/50",
    glow: "hover:shadow-rose-900/20",
    badge: "bg-rose-500/10 border-rose-500/30",
    tag: "Competitions",
    tagColor: "text-rose-400",
  },
  {
    title: "Sandbox Testing",
    description:
      "Test your prototype in bi-monthly, real-world simulated environments. Log operational data, identify failure points, and iterate on your design before moving to market launch.",
    icon: "🧪",
    accent: "from-emerald-500/20 to-emerald-600/5",
    border: "hover:border-emerald-500/50",
    glow: "hover:shadow-emerald-900/20",
    badge: "bg-emerald-500/10 border-emerald-500/30",
    tag: "Prototype Testing",
    tagColor: "text-emerald-400",
  },
  {
    title: "Startup Incubation",
    description:
      "Graduate from Yantriksha X Hub as a fully incorporated startup. Receive legal guidance, company registration support, investor introductions, and commercialization mentorship.",
    icon: "🚀",
    accent: "from-cyan-500/20 to-cyan-600/5",
    border: "hover:border-cyan-500/50",
    glow: "hover:shadow-cyan-900/20",
    badge: "bg-cyan-500/10 border-cyan-500/30",
    tag: "Launch Support",
    tagColor: "text-cyan-400",
  },
];

export default function Features() {
  return (
    <section id="events" className="bg-slate-950 py-28 text-white relative overflow-hidden">

      {/* Background decorative glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            ✦ Why Join Us?
          </span>

          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Everything You Need{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent">
              To Build A Startup
            </span>
          </h2>

          <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
            Yantriksha X Hub provides students with the complete ecosystem
            required to transform innovative ideas into successful startups.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group relative rounded-2xl p-7 border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm shadow-lg transition-all duration-300 ${feature.border} ${feature.glow} hover:shadow-xl hover:-translate-y-1 overflow-hidden`}
            >
              {/* Card gradient accent background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none`}
              />

              {/* Icon Badge */}
              <div
                className={`relative inline-flex items-center justify-center w-14 h-14 rounded-xl text-3xl border ${feature.badge} mb-5`}
              >
                {feature.icon}
              </div>

              {/* Tag */}
              <div className={`relative text-[10px] font-bold uppercase tracking-widest mb-2 ${feature.tagColor}`}>
                {feature.tag}
              </div>

              {/* Title */}
              <h3 className="relative text-xl font-bold text-white mb-3 group-hover:text-white transition tracking-tight">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="relative text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r ${feature.accent} rounded-b-2xl`} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}