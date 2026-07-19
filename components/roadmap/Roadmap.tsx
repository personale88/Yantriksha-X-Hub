interface Milestone {
  number: string;
  stage: string;
  title: string;
  desc: string;
  stageColor: string;
  badgeColor: string;
  dotColor: string;
  borderHoverColor: string;
}

const roadmapData: Milestone[] = [
  {
    number: "01",
    stage: "Stage -1: Confusion",
    title: "Problem Discovery",
    desc: "Learn to identify real-world pain points, conduct literature surveys, and research patent databases.",
    stageColor: "text-red-400",
    badgeColor: "bg-red-950/40 text-red-400 border-red-900/50",
    dotColor: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]",
    borderHoverColor: "hover:border-red-500/40 hover:shadow-red-900/10",
  },
  {
    number: "02",
    stage: "Stage -1: Confusion",
    title: "Cross-Disciplinary Team Formation",
    desc: "Group with students from Engineering, Law, and Business to form a compliant 10-member team.",
    stageColor: "text-red-400",
    badgeColor: "bg-red-950/40 text-red-400 border-red-900/50",
    dotColor: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]",
    borderHoverColor: "hover:border-red-500/40 hover:shadow-red-900/10",
  },
  {
    number: "03",
    stage: "Stage 0: Idea",
    title: "Idea Validation",
    desc: "Refine your value proposition, conduct user surveys, and define core product features.",
    stageColor: "text-yellow-400",
    badgeColor: "bg-yellow-950/40 text-yellow-400 border-yellow-900/50",
    dotColor: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.7)]",
    borderHoverColor: "hover:border-yellow-500/40 hover:shadow-yellow-900/10",
  },
  {
    number: "04",
    stage: "Stage 0: Idea",
    title: "Prototype Design",
    desc: "Draft system blueprints, select sensor hardware, and map circuit connections.",
    stageColor: "text-yellow-400",
    badgeColor: "bg-yellow-950/40 text-yellow-400 border-yellow-900/50",
    dotColor: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.7)]",
    borderHoverColor: "hover:border-yellow-500/40 hover:shadow-yellow-900/10",
  },
  {
    number: "05",
    stage: "Stage 0: Idea",
    title: "Feasibility Evaluation",
    desc: "Conduct engineering checks, analyze market viability, and review regulatory constraints.",
    stageColor: "text-yellow-400",
    badgeColor: "bg-yellow-950/40 text-yellow-400 border-yellow-900/50",
    dotColor: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.7)]",
    borderHoverColor: "hover:border-yellow-500/40 hover:shadow-yellow-900/10",
  },
  {
    number: "06",
    stage: "Stage 1: Product",
    title: "Resource Request",
    desc: "Submit lists of components, tools, and hardware required for prototype building.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]",
    borderHoverColor: "hover:border-emerald-500/40 hover:shadow-emerald-900/10",
  },
  {
    number: "07",
    stage: "Stage 1: Product",
    title: "Seed Funding",
    desc: "Apply for prototype fabrication reimbursement budget (capped at ₹50,000 per team).",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]",
    borderHoverColor: "hover:border-emerald-500/40 hover:shadow-emerald-900/10",
  },
  {
    number: "08",
    stage: "Stage 1: Product",
    title: "Mentorship Connect",
    desc: "Connect with specialized faculty advisors, startup coaches, and industry mentors.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]",
    borderHoverColor: "hover:border-emerald-500/40 hover:shadow-emerald-900/10",
  },
  {
    number: "09",
    stage: "Stage 1: Product",
    title: "Progress Reporting",
    desc: "Submit bi-weekly milestone reports to track development and automatically unlock roadmap stages.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]",
    borderHoverColor: "hover:border-emerald-500/40 hover:shadow-emerald-900/10",
  },
  {
    number: "10",
    stage: "Stage 1: Product",
    title: "Hackathon Challenges",
    desc: "Participate in collegiate hackathons and national startup competitions like Smart India Hackathon.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]",
    borderHoverColor: "hover:border-emerald-500/40 hover:shadow-emerald-900/10",
  },
  {
    number: "11",
    stage: "Stage 1: Product",
    title: "Sandbox Testing",
    desc: "Test prototypes in simulated real-world conditions (Sandbox logs).",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]",
    borderHoverColor: "hover:border-emerald-500/40 hover:shadow-emerald-900/10",
  },
  {
    number: "12",
    stage: "Stage 1: Product",
    title: "Research & IPR",
    desc: "Apply for patents, register trademarks, and write research papers.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]",
    borderHoverColor: "hover:border-emerald-500/40 hover:shadow-emerald-900/10",
  },
  {
    number: "13",
    stage: "Stage 1: Product",
    title: "Commercialization",
    desc: "Pitch your startup to venture capitalists and angel investors.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]",
    borderHoverColor: "hover:border-emerald-500/40 hover:shadow-emerald-900/10",
  },
  {
    number: "14",
    stage: "Stage 1: Product",
    title: "Startup Launch",
    desc: "Graduate from the incubation hub as an independent registered company.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]",
    borderHoverColor: "hover:border-emerald-500/40 hover:shadow-emerald-900/10",
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="bg-slate-950 py-28 text-white relative overflow-hidden">
      
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 z-10 relative">

        {/* Header */}
        <div className="text-center mb-24">
          <span className="text-blue-500 font-extrabold tracking-widest text-sm uppercase block">
            ROADMAP TIMELINE
          </span>

          <h2 className="text-5xl font-extrabold mt-4 tracking-tight leading-tight">
            Your Startup Incubation Path
          </h2>

          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto">
            Hover over any milestone in the chain below to inspect its detailed requirements. 
            Stages are sequenced chronologically from Stage -1 to Stage 1.
          </p>
        </div>

        {/* Chain Timeline Container */}
        <div className="relative border-l-2 border-slate-800 ml-4 md:ml-10 pl-8 md:pl-12 space-y-12 py-4">
          
          {roadmapData.map((item, idx) => (
            <div 
              key={item.title}
              className={`glass-card rounded-2xl p-6 border border-slate-900/60 shadow-lg relative transition-all duration-300 group cursor-pointer ${item.borderHoverColor}`}
            >
              
              {/* Linked Circle Indicator on Timeline */}
              <div className={`absolute -left-[41px] md:-left-[57px] top-7 w-6 h-6 rounded-full border-4 border-slate-950 bg-slate-950 flex items-center justify-center`}>
                <div className={`w-3.5 h-3.5 rounded-full ${item.dotColor}`} />
              </div>

              {/* Card Contents */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                
                {/* Milestone Badge and Title */}
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-bold text-sm tracking-wide">
                      Milestone {item.number}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${item.badgeColor}`}>
                      {item.stage.split(":")[0]}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mt-2 text-white group-hover:text-blue-400 transition tracking-tight">
                    {item.title}
                  </h3>
                </div>

                {/* Interactive Status hint */}
                <div className="text-xs text-gray-500 font-medium group-hover:text-blue-400 transition self-start md:self-center shrink-0">
                  <span className="inline-block group-hover:hidden">✦ Hover to view</span>
                  <span className="hidden group-hover:inline-block">✦ Requirements:</span>
                </div>

              </div>

              {/* Expandable detailed requirements */}
              <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-32 group-hover:opacity-100 group-hover:mt-4 transition-all duration-500 ease-in-out border-t border-transparent group-hover:border-slate-800/60 group-hover:pt-4">
                <p className="text-gray-300 text-sm font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}