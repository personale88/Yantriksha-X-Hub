export default function Footer() {
  return (
    <footer className="bg-slate-950 text-gray-400 py-10 border-t border-slate-800">

      <div className="max-w-7xl mx-auto px-6 text-center">

        <div className="flex flex-col items-center justify-center gap-3">
          <img 
            src="/logo.jpg" 
            alt="Yantriksha X Hub Logo" 
            className="h-16 w-auto rounded border border-slate-800" 
          />
          <h2 className="text-2xl font-bold text-white">
            Yantriksha X Hub
          </h2>
        </div>

        <p className="mt-3">
          Innovation • Collaboration • Startups
        </p>

        <p className="mt-6 text-sm">
          © 2026 Yantriksha X Hub. All Rights Reserved.
        </p>

      </div>

    </footer>
  );
}