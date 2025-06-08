import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const pages = [
    { label: "🏠 Home", path: "/" },
    { label: "🕑 History", path: "/history" },
    { label: "🏆 Leaderboard", path: "/leaderboard" }, // dummy
  ];

  return (
    <header className="fixed top-6 left-8 right-8 z-50 rounded-2xl shadow-xl glass bg-gradient-to-r from-cyan-900/60 via-fuchsia-900/50 to-purple-800/60 backdrop-blur-xl px-8 h-20 flex items-center justify-between animate-slide-down border border-white/10">

      {/* Brand */}
      <div
        onClick={() => navigate("/")}
        className="text-3xl font-extrabold text-white cursor-pointer tracking-wide"
      >
        Vionex
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex space-x-10 text-sm font-medium">
        {pages.map(({ label, path }) => (
          <Link
            key={path}
            to={path}
            className={`group relative text-white/90 transition duration-300 ease-in-out ${
              pathname === path ? "text-white" : ""
            }`}
          >
            {label}
            <span className="absolute left-1/2 bottom-[-4px] w-0 h-[2px] bg-cyan-400 transition-all duration-300 ease-in-out group-hover:w-full group-hover:left-0"></span>
          </Link>
        ))}
      </nav>

      
    </header>
  );
}
