const stats = [
  { number: "1200+", label: "Students", icon: "👥", color: "text-blue-400", glow: "shadow-blue-900/20" },
  { number: "250+",  label: "Ideas",    icon: "💡", color: "text-amber-400", glow: "shadow-amber-900/20" },
  { number: "100+",  label: "Projects", icon: "🛠️", color: "text-indigo-400", glow: "shadow-indigo-900/20" },
  { number: "60+",   label: "Mentors",  icon: "🎓", color: "text-emerald-400", glow: "shadow-emerald-900/20" },
  { number: "₹50K",  label: "Seed Funding", icon: "💰", color: "text-yellow-400", glow: "shadow-yellow-900/20" },
  { number: "30+",   label: "Industry Partners", icon: "🤝", color: "text-rose-400", glow: "shadow-rose-900/20" },
];

export default function Stats() {
  return (
    <section className="bg-slate-950 py-20 text-white relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-extrabold text-gray-400 tracking-widest uppercase text-sm">
            The Numbers Speak For Themselves
          </h2>
          <div className="mt-3 h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {stats.map(({ number, label, icon, color, glow }) => (
            <div
              key={label}
              className={`group glass-card rounded-2xl p-6 text-center border border-slate-800/60 hover:shadow-xl hover:${glow} transition-all duration-300`}
            >
              <div className="text-2xl mb-3">{icon}</div>
              <h2 className={`text-3xl font-black ${color} stat-glow`}>
                {number}
              </h2>
              <p className="mt-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                {label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}