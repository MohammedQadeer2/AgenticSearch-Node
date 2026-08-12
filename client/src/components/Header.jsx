import React from "react";
import { Menu, Share2 } from "lucide-react";

export default function Header({ onMenuClick }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 text-sm text-slate-300">
      <div className="flex items-center gap-2">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-slate-400 hover:bg-[#1e293b] hover:text-white md:hidden" aria-label="Open sidebar">
          <Menu className="h-5 w-5" />
        </button>
        <button className="rounded-lg px-2 py-1.5 transition hover:bg-[#1e293b] sm:px-3">
          <h1 className="text-lg font-bold tracking-tight text-slate-100 sm:text-xl">Qadeer<span className="text-indigo-300">.AI</span></h1>
        </button>
      </div>
      <button className="p-2 hover:bg-[#1e293b] rounded-lg transition" title="Share">
        <Share2 className="w-4 h-4" />
      </button>
    </header>
  );
}
