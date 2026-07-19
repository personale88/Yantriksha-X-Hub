interface Milestone {
  title: string;
  desc: string;
}

interface StageData {
  title: string;
  subtitle: string;
  color: string;
  badgeColor: string;
  borderHoverColor: string;
  items: Milestone[];
}

const stages: StageData[] = [
  {
    title: "Stage -1: Confusion",
    subtitle: "Problem Discovery & Team Formation",
    color: "text-red-400",
    badgeColor: "bg-red-950/40 text-red-400 border-red-900/50",
    borderHoverColor: "hover:border-red-500/40 hover:shadow-red-900/20",
    items: [
      {
        title: "Problem Discovery",
        desc: "Learn to identify real-world pain points, conduct literature surveys, and research patent databases.",
      },
      {
        title: "Cross-Disciplinary Team Formation",
        desc: "Group with students from Engineering, Law, and Business to form a compliant 10-member team.",
      },
    ],
  },
  {
    title: "Stage 0: Idea",
    subtitle: "Validation, Prototype & Feasibility",
    color: "text-yellow-400",
    badgeColor: "bg-yellow-950/40 text-yellow-400 border-yellow-900/50",
    borderHoverColor: "hover:border-yellow-500/40 hover:shadow-yellow-900/20",
    items: [
      {
        title: "Idea Validation",
        desc: "Refine your value proposition, conduct user surveys, and define core product features.",
      },
      {
        title: "Prototype Design",
        desc: "Draft system blueprints, select sensor hardware, and map circuit connections.",
      },
      {
        title: "Feasibility Evaluation",
        desc: "Conduct engineering checks, analyze market viability, and review regulatory constraints.",
      },
    ],
  },
  {
    title: "Stage 1: Product",
    subtitle: "Incubation & Startup Commercialization",
    color: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    borderHoverColor: "hover:border-emerald-500/40 hover:shadow-emerald-900/20",
    items: [
      {
        title: "Resource Request",
        desc: "Submit lists of components, tools, and hardware required for prototype building.",
      },
      {
        title: "Seed Funding",
        desc: "Apply for prototype fabrication reimbursement budget (capped at ₹50,000 per team).",
      },
      {
        title: "Mentorship Connect",
        desc: "Connect with specialized faculty advisors, startup coaches, and industry mentors.",
      },
      {
        title: "Progress Reporting",
        desc: "Submit bi-weekly milestone reports to track development and automatically unlock roadmap stages.",
      },
      {
        title: "Hackathon Challenges",
        desc: "Participate in collegiate hackathons and national startup competitions like Smart India Hackathon.",
      },
      {
        title: "Sandbox Testing",
        desc: "Test prototypes in simulated real-world conditions (Sandbox logs).",
      },
      {
        title: "Research & IPR",
        desc: "Apply for patents, register trademarks, and write research papers.",
      },
      {
        title: "Commercialization",
        desc: "Pitch your startup to venture capitalists and angel investors.",
      },
      {
        title: "Startup Launch",
        desc: "Graduate from the incubation hub as an independent registered company.",
      },
    ],
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="bg-slate-950 py-28 text-white relative overflow-hidden">
      
      {/* Decorative glows */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 z-10 relative">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-blue-500 font-extrabold tracking-widest text-sm uppercase block">
            ROADMAP
          </span>

          <h2 className="text-5xl font-extrabold mt-4 tracking-tight leading-tight">
            Your Innovation Journey
          </h2>

          <p className="mt-6 text-gray-400 text-lg">
            Follow a structured, milestone-driven path. Each stage is color-coded to match the Yantriksha incubation roadmap.
          </p>
        </div>

        {/* Stages Columns container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-20 items-start">
          
          {stages.map((stage, sIdx) => (
            <div 
              key={stage.title} 
              className="glass-card rounded-3xl p-8 border border-slate-900 shadow-2xl relative flex flex-col h-full"
            >
              
              {/* Column Header */}
              <div className="mb-8">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${stage.badgeColor}`}>
                  {stage.title.split(":")[0]}
                </span>
                <h3 className={`text-2xl font-extrabold mt-3 tracking-tight ${stage.color}`}>
                  {stage.title.split(":")[1].trim()}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {stage.subtitle}
                </p>
              </div>

              {/* Timeline Container */}
              <div className="relative border-l border-slate-800 pl-6 ml-2 space-y-8 flex-1">
                
                {stage.items.map((item, itemIdx) => (
                  <div 
                    key={item.title} 
                    className={`relative bg-slate-900/50 border border-slate-800/60 rounded-xl p-5 hover:-translate-y-1 transition-all duration-300 group shadow-md ${stage.borderHoverColor}`}
                  >
                    
                    {/* Circle Node on Timeline */}
                    <div className={`absolute -left-[31px] top-6 w-4 h-4 rounded-full border-2 border-slate-950 bg-slate-950 flex items-center justify-center`}>
                      <div className={`w-2 h-2 rounded-full ${sIdx === 0 ? 'bg-red-500' : sIdx === 1 ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                    </div>

                    {/* Milestone Info */}
                    <span className="text-xs text-gray-500 font-semibold uppercase block">
                      Milestone {itemIdx + 1}
                    </span>

                    <h4 className="text-lg font-bold text-white mt-1 group-hover:text-blue-400 transition leading-tight">
                      {item.title}
                    </h4>

                    <p className="text-gray-400 mt-2 text-sm leading-relaxed font-light">
                      {item.desc}
                    </p>

                  </div>
                ))}

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}