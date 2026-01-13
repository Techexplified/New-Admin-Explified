// Navbar.jsx
import React from "react";
import { Menu } from "lucide-react";

const DARK_BG = "#050816";

export default function Navbar({ onToggleSidebar }) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center border-b shadow-lg"
      style={{
        backgroundColor: `${DARK_BG}F2`,
        borderColor: "rgba(148,163,184,0.25)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex items-center justify-between w-full px-4 md:px-6">
        {/* Mobile sidebar toggle (optional) */}
        {onToggleSidebar && (
          <button
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg md:hidden border border-slate-700 text-slate-200 bg-slate-900/60 hover:bg-slate-800 transition-colors"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Spacer – navbar is now intentionally minimal */}
        <div className="hidden md:block text-xs text-slate-400">
          {/* Navbar content removed – everything lives in sidebar now */}
        </div>
      </div>
    </header>
  );
}
