import Link from "next/link";
   export default function Navbar() {
     return (
      <nav className="w-full bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/logo.jpg" 
            alt="Yantriksha X Hub Logo" 
            className="h-10 w-auto rounded border border-slate-700 group-hover:border-blue-500 transition" 
          />
          <span className="text-2xl font-bold text-blue-500 group-hover:text-blue-400 transition">
            Yantriksha X Hub
          </span>
        </Link>

        {/* Menu */}
        <ul className="flex gap-8">
          <li className="cursor-pointer hover:text-blue-400">Home</li>
          <li className="cursor-pointer hover:text-blue-400">About</li>
          <li className="cursor-pointer hover:text-blue-400">Roadmap</li>
          <li className="cursor-pointer hover:text-blue-400">Events</li>
          <li className="cursor-pointer hover:text-blue-400">Contact</li>
        </ul>

        {/* Login Button */}
        <Link href="/login">
  <button className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 transition">
    Login
  </button>
</Link>

      </div>
    </nav>
  );
}