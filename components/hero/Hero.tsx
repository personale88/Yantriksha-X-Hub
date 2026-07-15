import Link from "next/link";
export default function Hero() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-24">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}

          <div>

            <span className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm">
              Innovation & Cross-Disciplinary Collaboration Hub
            </span>

            <h1 className="text-6xl font-bold leading-tight mt-8">
              Don't Let
              <span className="text-blue-500"> Confusion </span>
              Stop You!
            </h1>

            <h2 className="text-4xl font-semibold mt-5 text-gray-300">
              Turn Your Ideas Into Reality
            </h2>

            <p className="mt-8 text-lg text-gray-300 leading-8 max-w-xl">
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
  <button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl transition">
    Join Yantriksha
  </button>
</Link>

              <button className="border border-white hover:bg-white hover:text-black px-8 py-4 rounded-xl transition">
                Explore Journey
              </button>

            </div>

          </div>

          {/* Right Side */}

          <div>

            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">

              <h3 className="text-3xl font-bold mb-8">
                Three Transformation Stages
              </h3>

              <div className="space-y-6">

                <div className="bg-slate-800 rounded-xl p-5">
                  <h4 className="text-xl font-semibold text-blue-400">
                    Stage -1 : Confusion
                  </h4>

                  <p className="text-gray-300 mt-2">
                    Helping students identify real-world problems,
                    discover opportunities, and build
                    cross-disciplinary teams.
                  </p>
                </div>

                <div className="bg-slate-800 rounded-xl p-5">
                  <h4 className="text-xl font-semibold text-yellow-400">
                    Stage 0 : Idea
                  </h4>

                  <p className="text-gray-300 mt-2">
                    Validate ideas, build prototypes, receive
                    mentorship, and evaluate technical, legal,
                    and business feasibility.
                  </p>
                </div>

                <div className="bg-slate-800 rounded-xl p-5">
                  <h4 className="text-xl font-semibold text-green-400">
                    Stage 1 : Product
                  </h4>

                  <p className="text-gray-300 mt-2">
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