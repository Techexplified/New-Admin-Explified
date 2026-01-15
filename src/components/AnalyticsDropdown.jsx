import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const analyticsOptions = [
  {
    value: "https://app.explified.com/",
    title: "Explified",
    subtitle: "app.explified.com",
  },
  {
    value: "https://notes.explified.com/",
    title: "notes",
    subtitle: "notes.explified.com",
  },
  {
    value: "https://expli.explified.com/",
    title: "expli",
    subtitle: "expli.explified.com",
  },
  {
    value: "https://academy.explified.com/",
    title: "academy",
    subtitle: "academy.explified.com",
  },
  {
    value: "https://affiliate.explified.com/",
    title: "affiliate",
    subtitle: "affiliate.explified.com",
  },
  {
    value: "https://community.explified.com/",
    title: "community",
    subtitle: "community.explified.com",
  },
  {
    value: "https://developer.explified.com/",
    title: "developer",
    subtitle: "developer.explified.com",
  },
  {
    value: "https://events.explified.com/",
    title: "events",
    subtitle: "events.explified.com",
  },
  {
    value: "https://labs.explified.com/",
    title: "labs",
    subtitle: "labs.explified.com",
  },
  {
    value: "https://stream.explified.com/",
    title: "streams",
    subtitle: "stream.explified.com",
  },
  {
    value: "https://slides.explified.com/",
    title: "slides",
    subtitle: "slides.explified.com",
  },
  {
    value: "https://projects.explified.com/",
    title: "projects",
    subtitle: "projects.explified.com",
  },
  {
    value: "https://marketapps.explified.com/",
    title: "marketapps",
    subtitle: "marketapps.explified.com",
  },
];

export default function AnalyticsDropdown() {
  const [selected, setSelected] = useState(analyticsOptions[0]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-fit" ref={dropdownRef}>
      {/* Selected value */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 text-left"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl capitalize font-semibold tracking-tight text-slate-50">
            {selected.title}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{selected.subtitle}</p>
        </div>

        <ChevronDown
          className={`h-5 w-5 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="
    absolute z-50 mt-3 w-[420px]
    rounded-xl border border-slate-800
    bg-slate-950 shadow-xl
    max-h-[360px] overflow-y-auto
    custom-scrollbar
  "
        >
          {analyticsOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
              className={`w-full px-4 py-3 text-left transition
          hover:bg-cyan-800/40
          ${selected.value === option.value ? "bg-cyan-800/60" : ""}`}
            >
              <p className="text-sm capitalize font-medium text-slate-100">
                {option.title}
              </p>
              <p className="text-xs text-slate-400 mt-1">{option.subtitle}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
