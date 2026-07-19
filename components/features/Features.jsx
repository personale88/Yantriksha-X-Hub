const features = [
  {
    title: "Seed Funding",
    description:
      "Receive funding support of up to ₹50,000 to transform your innovative ideas into working prototypes.",
    icon: "💰",
  },
  {
    title: "Expert Mentorship",
    description:
      "Get guidance from experienced faculty, industry professionals, entrepreneurs, and alumni.",
    icon: "👨‍🏫",
  },
  {
    title: "Cross-Disciplinary Teams",
    description:
      "Collaborate with students from Engineering, Law, and Business to build impactful solutions.",
    icon: "🤝",
  },
  {
    title: "Innovation Challenges",
    description:
      "Participate in hackathons, ideathons, startup competitions, and innovation events.",
    icon: "🏆",
  },
  {
    title: "Sandbox Testing",
    description:
      "Test your prototype in real-world environments before launching your product.",
    icon: "🧪",
  },
  {
    title: "Startup Incubation",
    description:
      "Turn your prototype into a startup with incubation, legal guidance, and commercialization support.",
    icon: "🚀",
  },
];

export default function Features() {
  return (
    <section id="events" className="bg-slate-950 py-24 text-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center">
          <p className="text-blue-400 font-semibold">
            WHY JOIN US?
          </p>

          <h2 className="text-5xl font-bold mt-4">
            Everything You Need To Build A Startup
          </h2>

          <p className="text-gray-400 mt-6 max-w-3xl mx-auto">
            Yantriksha X Hub provides students with the complete ecosystem
            required to transform innovative ideas into successful startups.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">

          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-900 rounded-2xl p-8 border border-slate-800 hover:border-blue-500 transition duration-300 hover:-translate-y-2"
            >
              <div className="text-5xl">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-bold mt-6">
                {feature.title}
              </h3>

              <p className="text-gray-400 mt-4 leading-7">
                {feature.description}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}