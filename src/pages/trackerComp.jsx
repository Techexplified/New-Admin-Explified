import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell,
  PieChart,
  Pie
} from "recharts";

/* ================= ICONS ================= */
const Icons = {
  Upload: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  Chart: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
  Pie: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  Table: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18"/></svg>,
  Close: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Filter: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  ChevronDown: () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  ChevronUp: () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>,
  Settings: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
};

/* ================= UTILS & PARSING ================= */
const parseCSV = (text) => {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim());
  const rows = lines.slice(1).map(l => l.split(",").map(c => c.trim()));
  return { headers, rows };
};

const isDateLike = (v) => !isNaN(Date.parse(v)) && v.length > 5 && !/^\d+$/.test(v);

// PROFESSIONAL PALETTE
const PRIMARY_COLOR = "#23b5b5";
const CHART_COLORS = [
  "#23b5b5", "#3b82f6", "#6366f1", "#f43f5e", "#eab308", "#14b8a6"
];

/* ================= MAIN COMPONENT ================= */
export default function ProductAnalyticsSleekFixed() {
  const [mode, setMode] = useState("upload");
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  
  // NEW: Screen Options State
  const [visibleColumns, setVisibleColumns] = useState([]); 
  const [showScreenOptions, setShowScreenOptions] = useState(false);

  // State
  const [filters, setFilters] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [groupByColumn, setGroupByColumn] = useState(""); 
  const [dateColumn, setDateColumn] = useState(""); 

  /* ---------- RESET ---------- */
  const resetDashboard = () => {
    setData([]);
    setHeaders([]);
    setVisibleColumns([]); 
    setFilters({});
    setActiveCategory(null);
    setSelectedRow(null);
    setGroupByColumn("");
    setDateColumn("");
  };

  /* ---------- UPLOAD LOGIC ---------- */
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    resetDashboard();
    const reader = new FileReader();
    reader.onload = () => {
      const { headers, rows } = parseCSV(reader.result);
      const mapped = rows.map(r => {
        const o = {};
        headers.forEach((h, i) => (o[h] = r[i] || ""));
        return o;
      });

      // Auto-Detection
      const colStats = headers.map(h => ({
        header: h,
        unique: new Set(mapped.map(m => m[h])).size
      }));

      const statusCol = colStats.find(s => /status|stage|state/i.test(s.header));
      const bestCatCol = colStats.find(s => s.unique >= 2 && s.unique <= 10);
      const detectedGroup = statusCol ? statusCol.header : (bestCatCol ? bestCatCol.header : headers[0]);
      const detectedDate = headers.find(h => isDateLike(mapped[0]?.[h])) || "";

      setHeaders(headers);
      setVisibleColumns(headers); // Default: All columns visible
      setData(mapped);
      setGroupByColumn(detectedGroup);
      setDateColumn(detectedDate);
      setMode("dashboard");
    };
    reader.readAsText(file);
  };

  /* ---------- CLEANUP EFFECT ---------- */
  // If a column is hidden via Screen Options, remove any active filters for it
  useEffect(() => {
    setFilters(currentFilters => {
      const newFilters = { ...currentFilters };
      let hasChanges = false;
      Object.keys(newFilters).forEach(key => {
        if (!visibleColumns.includes(key)) {
          delete newFilters[key];
          hasChanges = true;
        }
      });
      return hasChanges ? newFilters : currentFilters;
    });
  }, [visibleColumns]);

  /* ---------- DATA PROCESSING ---------- */
  const filteredData = useMemo(() => {
    return data.filter(d => {
      if (activeCategory && d[groupByColumn] !== activeCategory) return false;
      for (const k in filters) {
        if (filters[k] && d[k] !== filters[k]) return false;
      }
      return true;
    });
  }, [data, filters, activeCategory, groupByColumn]);

  const metrics = useMemo(() => {
    if (!groupByColumn) return {};
    const counts = {};
    filteredData.forEach(d => {
      const val = d[groupByColumn] || "Unknown";
      counts[val] = (counts[val] || 0) + 1;
    });
    return counts;
  }, [filteredData, groupByColumn]);

  const trendData = useMemo(() => {
    if (!dateColumn) return [];
    const map = {};
    filteredData.forEach(d => {
      const dateVal = d[dateColumn];
      if (!dateVal || !isDateLike(dateVal)) return;
      const key = new Date(dateVal).toISOString().slice(0, 10);
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData, dateColumn]);

  // UPDATED: Filter Config now respects visibleColumns
  const filterConfig = useMemo(() => {
    return headers
      .filter(h => visibleColumns.includes(h)) // Only include visible columns
      .filter(h => h !== groupByColumn && h !== dateColumn)
      .map(h => {
        const unique = new Set(data.map(d => d[h]));
        return (unique.size > 1 && unique.size < 20) ? { key: h, values: Array.from(unique) } : null;
      })
      .filter(Boolean);
  }, [data, headers, groupByColumn, dateColumn, visibleColumns]);

  /* ---------- TOGGLE COLUMN VISIBILITY ---------- */
  const toggleColumn = (column) => {
    setVisibleColumns((prev) => 
      prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
    );
  };

  /* ================= CUSTOM TOOLTIP ================= */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md z-50">
          <p className="text-slate-400 text-xs mb-1 font-medium tracking-wide uppercase">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-slate-200 font-semibold">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }} />
              <span className="capitalize">{entry.name}:</span> 
              <span style={{ color: PRIMARY_COLOR }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-[#23b5b5]/30">
      
      {/* 
        ===========================================
        SCREEN OPTIONS TOGGLE & PANEL
        ===========================================
      */}
      {mode === "dashboard" && (
        <div className="relative z-50 flex justify-end px-8 bg-slate-950">
           {/* Trigger Tab */}
           <button 
             onClick={() => setShowScreenOptions(!showScreenOptions)}
             className={`
               flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide
               border-b-0 border border-white/10 rounded-t-lg
               transition-all duration-200
               ${showScreenOptions ? "bg-slate-900 text-white border-b-slate-900" : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900"}
             `}
             style={{ marginBottom: showScreenOptions ? "-1px" : "0" }}
           >
             Screen Options
             {showScreenOptions ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
           </button>
        </div>
      )}

      {/* Options Panel (Slide Down) */}
      <AnimatePresence>
        {mode === "dashboard" && showScreenOptions && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-900 border-b border-white/10 shadow-2xl relative z-40"
          >
            <div className="px-8 py-6">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                 <Icons.Settings /> Toggle Columns & Filters
              </h4>
              <p className="text-xs text-slate-500 mb-4">Unchecking a box will hide it from the Table AND the Filter bar.</p>
              
              <div className="flex flex-wrap gap-4">
                {headers.map((h) => (
                  <label key={h} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={visibleColumns.includes(h)}
                      onChange={() => toggleColumn(h)}
                      className="accent-[#23b5b5] w-4 h-4 rounded border-slate-700 bg-slate-800 focus:ring-offset-slate-900" 
                    />
                    <span className="text-sm text-slate-400 group-hover:text-white transition-colors select-none">
                      {h}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* HEADER */}
      <header className="px-8 py-5 border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#23b5b5]/10 border border-[#23b5b5]/20 text-[#23b5b5]">
            <Icons.Chart />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            V<span className="text-[#23b5b5] ml-2">Tracker</span>
          </h1>
        </div>
        
        {mode === "dashboard" && (
          <div className="flex items-center gap-4">
             {/* Dynamic Controller */}
             <div className="hidden md:flex items-center gap-2 text-xs bg-slate-900 border border-white/5 rounded-full px-3 py-1.5">
               <span className="text-slate-500 font-medium">Group by:</span>
               <select 
                  value={groupByColumn} 
                  onChange={(e) => setGroupByColumn(e.target.value)}
                  className="bg-transparent text-slate-300 font-semibold outline-none cursor-pointer"
               >
                  {headers.map(h => <option key={h} value={h} className="bg-slate-900 text-slate-300">{h}</option>)}
               </select>
             </div>

             <button
              onClick={() => { resetDashboard(); setMode("upload"); setShowScreenOptions(false); }}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-white text-slate-950 hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/5"
            >
              <Icons.Upload />
              New Data
            </button>
          </div>
        )}
      </header>

      {/* UPLOAD MODE */}
      <AnimatePresence mode="wait">
        {mode === "upload" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center min-h-[80vh] p-6"
          >
            <div className="w-full max-w-lg">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
                <p className="text-slate-500 text-sm">Upload your dataset to generate professional insights.</p>
              </div>

              <label className="group relative flex flex-col items-center justify-center w-full h-64 rounded-3xl border border-dashed border-slate-700 hover:border-[#23b5b5] bg-slate-900/50 hover:bg-[#23b5b5]/5 transition-all cursor-pointer overflow-hidden">
                <input type="file" hidden accept=".csv" onChange={handleUpload} />
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-[#23b5b5] group-hover:scale-110 transition-all mb-4">
                  <Icons.Upload />
                </div>
                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Select CSV File</p>
                <p className="text-xs text-slate-500 mt-1">Supports standard format</p>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD MODE */}
      {mode === "dashboard" && (
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 max-w-[1600px] mx-auto space-y-8"
        >
          {/* 1. FILTER BAR (DYNAMICALLY HIDDEN BASED ON SCREEN OPTIONS) */}
          <div className="flex flex-wrap items-center gap-3 pb-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#23b5b5]/10 text-[#23b5b5] text-xs font-bold uppercase tracking-wider">
               <Icons.Filter /> Filters
            </div>
            {filterConfig.map(f => (
              <div key={f.key} className="relative group">
                <select
                    value={filters[f.key] || ""}
                    onChange={e => setFilters(s => ({ ...s, [f.key]: e.target.value || null }))}
                    className="appearance-none bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs rounded-lg pl-3 pr-8 py-2 focus:ring-1 focus:ring-[#23b5b5] outline-none transition-all cursor-pointer min-w-[140px]"
                >
                    <option value="">All {f.key}</option>
                    {f.values.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <Icons.ChevronDown />
                </div>
              </div>
            ))}
            
            {/* Show message if no filters available due to hiding */}
            {filterConfig.length === 0 && (
                <span className="text-xs text-slate-500 italic ml-2">Enable columns in Screen Options to see filters.</span>
            )}

            {Object.keys(filters).length > 0 && (
                <button onClick={() => setFilters({})} className="text-xs text-slate-500 hover:text-white px-3 transition-colors">
                    Reset
                </button>
            )}
          </div>

          {/* 2. KPI METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(metrics).map(([key, value], index) => {
               const isActive = activeCategory === key;
               return (
                 <motion.div
                   key={key}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                   onClick={() => setActiveCategory(isActive ? null : key)}
                   className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                     isActive 
                       ? "bg-[#23b5b5] border-[#23b5b5] text-white shadow-lg shadow-[#23b5b5]/20" 
                       : "bg-slate-900 border-white/5 hover:border-white/10"
                   }`}
                 >
                   <div className="flex flex-col relative z-10">
                     <span className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isActive ? "text-white/80" : "text-slate-500"}`}>
                       {key}
                     </span>
                     <span className={`text-3xl font-bold ${isActive ? "text-white" : "text-slate-100"}`}>
                       {value}
                     </span>
                   </div>
                   <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${
                     isActive ? "bg-white" : "bg-[#23b5b5]"
                   }`} />
                 </motion.div>
               );
            })}
          </div>

          {/* 3. CHARTS ROW */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* MAIN CHART */}
            <div className="xl:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                 <Icons.Chart /> Overview by {groupByColumn}
              </h3>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(metrics).map(([k, v]) => ({ name: k, value: v }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      {Object.entries(metrics).map((_, i) => (
                        <linearGradient key={i} id={`colorBar${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#475569" 
                      tick={{fontSize: 12, fill: '#94a3b8'}} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10} 
                    />
                    <YAxis 
                      stroke="#475569" 
                      tick={{fontSize: 12, fill: '#94a3b8'}} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff', opacity: 0.03}} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {Object.entries(metrics).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#colorBar${index})`} stroke={CHART_COLORS[index % CHART_COLORS.length]} strokeOpacity={0.5} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SECONDARY CHART */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-sm">
               <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                 {dateColumn ? <Icons.Chart /> : <Icons.Pie />}
                 {dateColumn ? "Trend Analysis" : "Distribution"}
               </h3>
               <div className="h-[320px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    {dateColumn ? (
                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#23b5b5" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#23b5b5" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#475569" 
                                tick={{fontSize: 11, fill: '#94a3b8'}} 
                                tickFormatter={(t) => t.slice(5)} 
                                axisLine={false} 
                                tickLine={false} 
                                dy={10} 
                            />
                            <YAxis stroke="#475569" tick={{fontSize: 11, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#23b5b5" 
                                strokeWidth={3} 
                                fill="url(#colorTeal)" 
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                            />
                        </AreaChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={Object.entries(metrics).map(([k, v]) => ({ name: k, value: v }))}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {Object.entries(metrics).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    )}
                 </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* 4. TABLE (HIDDEN COLUMNS LOGIC) */}
          <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Icons.Table /> Filtered Results
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {filteredData.length} records
              </span>
            </div>

            <div
              className="relative max-h-[500px] overflow-auto overscroll-contain scrollbar"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <table className="min-w-full text-sm text-left">
                <thead className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur">
                  <tr>
                    {/* Only Show Visible Columns */}
                    {headers.map(h => (
                       visibleColumns.includes(h) && (
                        <th key={h} className="px-6 py-4 whitespace-nowrap">
                          {h}
                        </th>
                      )
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredData.slice(0, 100).map((d, i) => (
                    <tr
                      key={i}
                      onClick={() => setSelectedRow(d)}
                      className="hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      {/* Only Show Visible Columns Data */}
                      {headers.map(h => (
                         visibleColumns.includes(h) && (
                          <td key={h} className="px-6 py-3 whitespace-nowrap text-slate-300">
                            {d[h] || "—"}
                          </td>
                        )
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {visibleColumns.length === 0 && (
                 <div className="p-8 text-center text-slate-500">
                    All columns are hidden via Screen Options.
                 </div>
              )}
            </div>
          </div>

        </motion.main>
      )}

      {/* SLIDE OVER PANEL */}
      <AnimatePresence>
        {selectedRow && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRow(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[50]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-white/10 z-[60] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900">
                 <h2 className="text-lg font-bold text-white">Record Details</h2>
                 <button onClick={() => setSelectedRow(null)} className="text-slate-500 hover:text-white transition-colors">
                   <Icons.Close />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {/* Highlight Box */}
                 <div className="bg-[#23b5b5]/10 border border-[#23b5b5]/20 rounded-xl p-4">
                     <label className="text-xs uppercase font-bold text-[#23b5b5] tracking-widest">{groupByColumn}</label>
                     <div className="text-xl font-bold text-white mt-1">{selectedRow[groupByColumn]}</div>
                 </div>

                 <div className="space-y-4">
                    {/* Only show visible columns in details? Or all? Usually details show everything, but sticking to "Screen Options" logic, we can hide them here too. 
                        For now, I'll show ALL data in details panel so you can inspect hidden fields. */}
                    {headers.filter(h => h !== groupByColumn).map(h => (
                        <div key={h} className="flex flex-col border-b border-white/5 pb-2">
                           <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{h}</span>
                           <span className="text-sm text-slate-200">{selectedRow[h] || "—"}</span>
                        </div>
                    ))}
                 </div>
              </div>
              <div className="p-6 border-t border-white/5 bg-slate-900">
                  <button onClick={() => setSelectedRow(null)} className="w-full py-3 bg-white text-slate-950 font-bold rounded-lg hover:bg-slate-200 transition-colors">
                      Done
                  </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}