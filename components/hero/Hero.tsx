import Link from "next/link";
import Image from "next/image";
import RobotGraphic from "@/components/graphics/RobotGraphic";

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen bg-space-grid text-white flex items-center overflow-hidden relative pt-20"
    >
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-amber-500/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-900/10 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-14 z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Left Content */}
          <div>
            <span className="section-pill">
              ✦ Innovation & Cross-Disciplinary Collaboration Hub
            </span>

            <h1 className="text-6xl lg:text-7xl font-extrabold leading-[1.08] mt-2 tracking-tight">
              Don&apos;t Let{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                Confusion
              </span>
              <br />Stop You!
            </h1>

            <h2 className="text-2xl font-semibold mt-5 text-gray-400 tracking-wide">
              Turn Your Ideas Into Reality
            </h2>

            <p className="mt-7 text-lg text-gray-300 leading-8 max-w-xl font-light">
              Yantriksha_X_Hub is a Student-Driven Innovation and
              Cross-Disciplinary Collaboration Hub designed to help students
              turn ideas into real-world products and startups. We bring
              together Engineering, Law, and Business students to collaborate,
              innovate, and solve real-world challenges.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link href="/register">
                <button className="relative group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-xl shadow-blue-900/40 border border-blue-500/30 hover:-translate-y-1 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-1">
                    Join Yantriksha
                    <span className="inline-block relative h-6 w-8 mx-0.5 align-middle shrink-0">
                      <Image src="/logo.png" fill className="object-contain" style={{ mixBlendMode: 'screen' }} alt="X" />
                    </span>
                    Hub →
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </Link>

              <Link href="/#roadmap">
                <button className="border border-slate-700/60 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800/70 hover:border-slate-600 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1">
                  Explore Journey
                </button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-12 items-center">
              {[
                { val: "1200+", label: "Students" },
                { val: "₹50K", label: "Seed Funding" },
                { val: "60+", label: "Mentors" },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-extrabold text-blue-400">{val}</div>
                  <div className="text-xs text-gray-500 mt-0.5 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side — Animated Yantriksha Assistant Robot */}
          <div className="relative">
            <RobotGraphic />
          </div>

        </div>
      </div>
    </section>
  );
}