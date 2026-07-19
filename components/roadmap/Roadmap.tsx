const roadmap = [
  {
    stage: "Stage -1",
    title: "Problem Discovery",
    color: "bg-red-500",
  },
  {
    stage: "Stage -1",
    title: "Cross-Disciplinary Team Formation",
    color: "bg-orange-500",
  },
  {
    stage: "Stage 0",
    title: "Idea Validation",
    color: "bg-yellow-500",
  },
  {
    stage: "Stage 0",
    title: "Prototype Design",
    color: "bg-green-500",
  },
  {
    stage: "Stage 0",
    title: "Industry Evaluation",
    color: "bg-cyan-500",
  },
  {
    stage: "Stage 1",
    title: "Resource Request",
    color: "bg-blue-500",
  },
  {
    stage: "Stage 1",
    title: "Seed Funding",
    color: "bg-indigo-500",
  },
  {
    stage: "Stage 1",
    title: "Mentorship",
    color: "bg-purple-500",
  },
  {
    stage: "Stage 1",
    title: "Bi-Weekly Reports",
    color: "bg-pink-500",
  },
  {
    stage: "Stage 1",
    title: "Hackathons",
    color: "bg-red-500",
  },
  {
    stage: "Stage 1",
    title: "Sandbox Testing",
    color: "bg-green-600",
  },
  {
    stage: "Stage 1",
    title: "Research",
    color: "bg-sky-500",
  },
  {
    stage: "Stage 1",
    title: "Commercialization",
    color: "bg-orange-600",
  },
  {
    stage: "Stage 1",
    title: "Startup Launch",
    color: "bg-blue-600",
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="bg-slate-900 py-24 text-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center">
          <p className="text-blue-400 font-semibold">
            ROADMAP
          </p>

          <h2 className="text-5xl font-bold mt-4">
            Your Innovation Journey
          </h2>

          <p className="mt-6 text-gray-400">
            Follow a structured path from confusion to startup.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">

          {roadmap.map((item) => (
            <div
              key={item.title}
              className="bg-slate-800 rounded-2xl p-6 hover:scale-105 transition"
            >
              <div
                className={`w-14 h-14 rounded-full ${item.color} flex items-center justify-center font-bold`}
              >
                ✓
              </div>

              <p className="text-blue-400 mt-6">
                {item.stage}
              </p>

              <h3 className="text-xl font-bold mt-2">
                {item.title}
              </h3>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}