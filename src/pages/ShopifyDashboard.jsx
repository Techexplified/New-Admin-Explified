// src/components/ShopifyAnalyticsDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  AreaChart, Area
} from "recharts";

const PAGE_SIZE = 10;
const toNumber = v => (typeof v === "number" ? v : Number(v || 0));
const currencyFormat = (cur, n) => `${cur ?? "USD"} ${Number(n || 0).toFixed(2)}`;

function mapEventTag(evt) {
  const e = (evt || "").toUpperCase();
  if (e === "RELATIONSHIP_INSTALLED") return { text: "Installed", color: "bg-green-100 text-green-800" };
  if (e === "RELATIONSHIP_UNINSTALLED") return { text: "Uninstalled", color: "bg-red-100 text-red-800" };
  if (e === "RELATIONSHIP_REACTIVATED") return { text: "Re-opened", color: "bg-blue-100 text-blue-800" };
  if (e === "SUBSCRIPTION_CHARGE_ACTIVATED") return { text: "Subscription active", color: "bg-indigo-100 text-indigo-800" };
  if (e === "SUBSCRIPTION_CHARGE_CANCELED") return { text: "Subscription canceled", color: "bg-red-100 text-red-800" };
  return { text: e.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase()), color: "bg-gray-100 text-gray-800" };
}

export default function ShopifyAnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [ts, setTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("https://us-central1-explified-app.cloudfunctions.net/api/api/shopify/partner/analytics", { credentials: "include" });
        const text = await res.text();
        let json = null;
        try { json = JSON.parse(text); } catch (e) {}
        if (!res.ok) {
          const message = json?.error || text || `Request failed: ${res.status}`;
          throw new Error(message);
        }
        if (!json) throw new Error("Invalid JSON response from analytics endpoint");

        // build a tiny sparkline timeline for earnings (visual-only)
        const dates = new Set();
        (json.installsByDay || []).forEach(d => dates.add(d.date));
        (json.uninstallsByDay || []).forEach(d => dates.add(d.date));
        const dateArr = Array.from(dates).sort();
        const timeline = dateArr.length ? dateArr.map(d => ({ date: d, value: 0 })) : [{ date: (new Date()).toISOString().slice(0,10), value: 0 }];

        if (!mounted) return;
        setData(json);
        setTs(timeline);
      } catch (e) {
        setErr(e.message || "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-8 font-sans">Loading analytics…</div>;
  if (err) return <div className="p-8 text-red-600 font-sans">Error: {err}</div>;
  if (!data) return null;

  // timeseries for installs/uninstalls chart
  const aligned = {};
  (data.installsByDay || []).forEach(p => { aligned[p.date] = { date: p.date, installs: p.count, uninstalls: 0 }; });
  (data.uninstallsByDay || []).forEach(p => {
    aligned[p.date] = aligned[p.date] || { date: p.date, installs: 0, uninstalls: 0 };
    aligned[p.date].uninstalls = p.count;
  });
  const timeseries = Object.values(aligned).sort((a,b) => a.date.localeCompare(b.date));

  // earnings breakdown canonical rows
  const earningsByType = data.earningsByType || {};
  const breakdown = [
    { key: "One-time charges", value: earningsByType.ONE_TIME_CHARGE_ACCEPTED ?? earningsByType.one_time ?? 0 },
    { key: "Recurring charges", value: earningsByType.SUBSCRIPTION_CHARGE_ACTIVATED ?? earningsByType.recurring ?? 0 },
    { key: "Usage-based charges", value: earningsByType.USAGE_CHARGE_APPLIED ?? earningsByType.usage ?? 0 },
    { key: "Application credits", value: earningsByType.CREDIT_APPLIED ?? earningsByType.credits ?? 0 },
  ];

  // latest app history
  const history = data.appHistory || [];
  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pageItems = history.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">{data.appName || "AnnounceMate"}</h2>
          <p className="text-sm text-slate-500 mt-1">Partner dashboard — App analytics</p>
        </div>

      </div>

      {/* Top summary cards (full-width row) */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-4 bg-gradient-to-r from-sky-50 to-white shadow-sm">
          <div className="text-xs text-slate-500">Total earnings</div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">{currencyFormat(data.currency, data.totalEarnings)}</div>
          <div className="text-xs text-slate-400 mt-1">Payouts after fees</div>
        </div>

        <div className="rounded-xl p-4 bg-gradient-to-r from-indigo-50 to-white shadow-sm">
          <div className="text-xs text-slate-500">Merchants with app</div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">{data.merchantsCount ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Unique shops</div>
        </div>

        <div className="rounded-xl p-4 bg-gradient-to-r from-green-50 to-white shadow-sm">
          <div className="text-xs text-slate-500">Installs</div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">{data.installsCount ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Total installs</div>
        </div>

        <div className="rounded-xl p-4 bg-gradient-to-r from-rose-50 to-white shadow-sm">
          <div className="text-xs text-slate-500">Uninstalls</div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">{data.uninstallsCount ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Total uninstalls</div>
        </div>
      </div>

      {/* MAIN: left = chart, right = Earnings small card + compact summary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-6">
        {/* LEFT: Installs vs Uninstalls chart */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Installs vs Uninstalls</h3>
              <p className="text-sm text-slate-500 mt-1">Last recorded days</p>
            </div>
            <div className="text-sm text-slate-500">Total installs: <span className="font-semibold text-slate-900 ml-1">{data.installsCount ?? 0}</span></div>
          </div>

          <div className="h-64">
            {timeseries.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">No time series data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeseries} margin={{ top: 6, right: 12, left: 6, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `${v}`} />
                  <Line type="monotone" dataKey="installs" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="uninstalls" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RIGHT: Earnings compact card + 3 small summary cards */}
        <div className="space-y-4">
          {/* Earnings compact card (moved next to chart) */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-500">Earnings</div>
                <div className="text-lg font-bold mt-2">{currencyFormat(data.currency, data.totalEarnings)}</div>
                <div className="text-xs text-slate-400 mt-1">Last 30 days</div>
              </div>
            </div>

            <div className="mt-4 border-t pt-3">
              <div className="text-sm flex justify-between py-1">
                <div className="text-slate-600 font-medium">One-time charges</div>
                <div className="text-slate-900 font-semibold">{currencyFormat(data.currency, breakdown[0].value)}</div>
              </div>
              <div className="text-sm flex justify-between py-1">
                <div className="text-slate-600 font-medium">Recurring charges</div>
                <div className="text-slate-900 font-semibold">{currencyFormat(data.currency, breakdown[1].value)}</div>
              </div>
              <div className="text-sm flex justify-between py-1">
                <div className="text-slate-600 font-medium">Usage-based charges</div>
                <div className="text-slate-900 font-semibold">{currencyFormat(data.currency, breakdown[2].value)}</div>
              </div>
              <div className="text-sm flex justify-between py-1">
                <div className="text-slate-600 font-medium">Application credits</div>
                <div className="text-slate-900 font-semibold">{currencyFormat(data.currency, breakdown[3].value)}</div>
              </div>
            </div>

            <div className="mt-3 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ts}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0b74ff" stopOpacity={0.16}/>
                      <stop offset="100%" stopColor="#0b74ff" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip formatter={(val) => currencyFormat(data.currency, val)} />
                  <Area type="monotone" dataKey="value" stroke="#0b74ff" fill="url(#g1)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* compact small cards under earnings (keeps them near chart) */}

        </div>
      </div>

      {/* Latest app history table only */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Latest app history</h3>
          <div className="text-sm text-slate-500">Page {currentPage} / {totalPages}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-600 uppercase text-xs">
              <tr>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Store</th>
                <th className="py-3 pr-4">Event</th>
                <th className="py-3 pr-4">Event details</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">No recent events</td>
                </tr>
              )}
              {pageItems.map((row, i) => {
                const tag = mapEventTag(row.event);
                return (
                  <tr key={i} className="border-t border-t-gray-200">
                    <td className="py-3 pr-4 align-top w-48">{new Date(row.date).toLocaleString()}</td>
                    <td className="py-3 pr-4 align-top">
                      {row.store && row.store.includes("myshopify") ? (
                        <a href={`https://${row.store}`} target="_blank" rel="noreferrer" className="text-sky-600 underline">{row.store}</a>
                      ) : (
                        <span className="text-sky-600 underline">{row.store}</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${tag.color}`}>
                        {tag.text}
                      </span>
                    </td>
                    <td className="py-3 pr-4 align-top max-w-2xl">
                      <details>
                        <summary className="cursor-pointer text-sky-600 underline">View details</summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs break-words">{row.details}</pre>
                      </details>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">{history.length} total events</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-white border text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <div className="text-sm text-slate-700">{currentPage} / {totalPages}</div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-sky-600 text-white text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}
