// src/components/shopifyDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import {
  ShoppingBag,
  Users as UsersIcon,
  ArrowDownToLine,
  DollarSign,
} from "lucide-react";

const PAGE_SIZE = 10;
const TEAL = "#23B5B5";

const currencyFormat = (cur, n) =>
  `${cur ?? "USD"} ${Number(n || 0).toFixed(2)}`;

function mapEventTag(evt) {
  const e = (evt || "").toUpperCase();
  if (e === "RELATIONSHIP_INSTALLED")
    return {
      text: "Installed",
      color:
        "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40",
    };
  if (e === "RELATIONSHIP_UNINSTALLED")
    return {
      text: "Uninstalled",
      color: "bg-rose-500/10 text-rose-300 border border-rose-500/40",
    };
  if (e === "RELATIONSHIP_REACTIVATED")
    return {
      text: "Re-opened",
      color: "bg-sky-500/10 text-sky-300 border border-sky-500/40",
    };
  if (e === "SUBSCRIPTION_CHARGE_ACTIVATED")
    return {
      text: "Subscription active",
      color:
        "bg-indigo-500/10 text-indigo-300 border border-indigo-500/40",
    };
  if (e === "SUBSCRIPTION_CHARGE_CANCELED")
    return {
      text: "Subscription canceled",
      color: "bg-rose-500/10 text-rose-300 border border-rose-500/40",
    };
  return {
    text: e
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase()),
    color: "bg-slate-800 text-slate-200 border border-slate-600",
  };
}

function normalizeStatus(rawStatus) {
  if (!rawStatus) return null;
  const s = String(rawStatus).toUpperCase();
  if (s.includes("PUBLISH")) return "Published";
  if (s.includes("SUBMIT") || s.includes("REVIEW")) return "Submitted";
  if (s.includes("DRAFT")) return "Draft";
  return rawStatus;
}

/**
 * Drawer-style Shopify analytics panel
 * Props:
 *  - open: boolean (show / hide drawer)
 *  - onClose: () => void (called when backdrop / Close pressed)
 *  - app: { name, analyticsKey, status, ... } (selected Shopify app from ProductDashboard)
 */
export default function ShopifyAnalyticsDashboard({ open, onClose, app }) {
  const [data, setData] = useState(null);
  const [ts, setTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [page, setPage] = useState(1);

  // reset when app changes
  useEffect(() => {
    setData(null);
    setTs([]);
    setErr(null);
    setPage(1);
  }, [app]);

  useEffect(() => {
    if (!open || !app) return;

    let mounted = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const key =
          app.analyticsKey || app.key || app.id || app.name || "default";
        const res = await fetch(
          `https://api-pf6diz22ka-uc.a.run.app/api/shopify/partner/analytics?app=${encodeURIComponent(
            key
          )}`
        );
        const text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {}
        if (!res.ok) {
          const message =
            json?.error || text || `Request failed: ${res.status}`;
          throw new Error(message);
        }
        if (!json)
          throw new Error("Invalid JSON response from analytics endpoint");

        // sparkline timeline (visual-only)
        const dates = new Set();
        (json.installsByDay || []).forEach((d) => dates.add(d.date));
        (json.uninstallsByDay || []).forEach((d) => dates.add(d.date));
        const dateArr = Array.from(dates).sort();
        const timeline = dateArr.length
          ? dateArr.map((d) => ({ date: d, value: 0 }))
          : [];

        if (!mounted) return;
        setData(json);
        setTs(timeline);
      } catch (e) {
        if (mounted) setErr(e.message || "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [open, app]);

  // build aligned timeseries for installs vs uninstalls
  let timeseries = [];
  let breakdown = [];
  let history = [];
  let totalPages = 1;
  let currentPage = 1;
  let pageItems = [];
  let hasAnyData = false;

  if (data) {
    const aligned = {};
    (data.installsByDay || []).forEach((p) => {
      aligned[p.date] = {
        date: p.date,
        installs: p.count,
        uninstalls: 0,
      };
    });
    (data.uninstallsByDay || []).forEach((p) => {
      aligned[p.date] =
        aligned[p.date] || {
          date: p.date,
          installs: 0,
          uninstalls: 0,
        };
      aligned[p.date].uninstalls = p.count;
    });
    timeseries = Object.values(aligned).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const earningsByType = data.earningsByType || {};
    breakdown = [
      {
        key: "One-time charges",
        value:
          earningsByType.ONE_TIME_CHARGE_ACCEPTED ??
          earningsByType.one_time ??
          0,
      },
      {
        key: "Recurring charges",
        value:
          earningsByType.SUBSCRIPTION_CHARGE_ACTIVATED ??
          earningsByType.recurring ??
          0,
      },
      {
        key: "Usage-based charges",
        value:
          earningsByType.USAGE_CHARGE_APPLIED ??
          earningsByType.usage ??
          0,
      },
      {
        key: "Application credits",
        value:
          earningsByType.CREDIT_APPLIED ?? earningsByType.credits ?? 0,
      },
    ];

    history = data.appHistory || [];
    totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, page), totalPages);
    pageItems = history.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE
    );

    hasAnyData =
      (data.installsCount || 0) +
        (data.uninstallsCount || 0) +
        (history.length || 0) +
        (data.totalEarnings || 0) >
      0;
  }

  // panel body content
  let body;
  if (!app) {
    body = (
      <div className="flex items-center justify-center py-16 text-sm text-slate-300">
        Select a Shopify app from the Product Dashboard to view analytics.
      </div>
    );
  } else if (loading) {
    body = (
      <div className="flex items-center justify-center py-16 text-sm text-slate-300">
        Loading analytics…
      </div>
    );
  } else if (err) {
    body = (
      <div className="flex flex-col items-center justify-center py-16 text-sm text-red-400 gap-3">
        <div>Error: {err}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-md bg-slate-900 text-slate-100 text-xs hover:bg-slate-800 border border-slate-700 transition"
        >
          Retry
        </button>
      </div>
    );
  } else if (!data || !hasAnyData) {
    // 🔹 If no installs/uninstalls/earnings/history → show nothing
    body = (
      <div className="flex items-center justify-center py-16 text-sm text-slate-300">
        No analytics data for this app yet.
      </div>
    );
  } else {
    body = (
      <div className="space-y-8">
        {/* Top summary cards */}
        <section>
          <h3 className="text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase mb-3">
            Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl p-4 bg-slate-900 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">
                    Total earnings
                  </div>
                  <div className="text-xl font-extrabold text-slate-50 mt-2">
                    {currencyFormat(data.currency, data.totalEarnings)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Payouts after fees
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/40">
                  <DollarSign className="w-4 h-4 text-emerald-300" />
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4 bg-slate-900 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">
                    Merchants with app
                  </div>
                  <div className="text-xl font-extrabold text-slate-50 mt-2">
                    {data.merchantsCount ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Unique shops
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-800 border border-slate-700">
                  <ShoppingBag className="w-4 h-4 text-slate-100" />
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4 bg-slate-900 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Installs</div>
                  <div className="text-xl font-extrabold text-slate-50 mt-2">
                    {data.installsCount ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Total installs
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/40">
                  <ArrowDownToLine className="w-4 h-4 text-emerald-300" />
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4 bg-slate-900 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">
                    Uninstalls
                  </div>
                  <div className="text-xl font-extrabold text-slate-50 mt-2">
                    {data.uninstallsCount ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Total uninstalls
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-rose-500/10 border border-rose-500/40">
                  <UsersIcon className="w-4 h-4 text-rose-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main grid: chart + earnings */}
        <section>
          <h3 className="text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase mb-3">
            Performance
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] gap-6">
            {/* Installs vs uninstalls */}
            <div className="bg-slate-900 rounded-xl shadow-sm p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-50">
                    Installs vs uninstalls
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Trend over time
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Installs
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Uninstalls
                  </span>
                </div>
              </div>

              <div className="h-64">
                {timeseries.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    No time series data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeseries}
                      margin={{ top: 6, right: 12, left: 6, bottom: 6 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1f2937"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "#e5e7eb" }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "#e5e7eb" }}
                      />
                      <Tooltip
                        formatter={(v) => `${v}`}
                        contentStyle={{
                          backgroundColor: "#020617",
                          borderRadius: 6,
                          border: "1px solid #1f2937",
                          color: "#e5e7eb",
                        }}
                        labelStyle={{ color: "#e5e7eb" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="installs"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="uninstalls"
                        stroke="#f97373"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Earnings panel */}
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-xl shadow-sm p-4 border border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Earnings</div>
                    <div className="text-lg font-bold mt-2 text-slate-50">
                      {currencyFormat(data.currency, data.totalEarnings)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Last 30 days
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-800 pt-3 space-y-1.5">
                  <div className="text-sm flex justify-between">
                    <div className="text-slate-200 font-medium">
                      One-time charges
                    </div>
                    <div className="text-slate-50 font-semibold">
                      {currencyFormat(data.currency, breakdown[0].value)}
                    </div>
                  </div>
                  <div className="text-sm flex justify-between">
                    <div className="text-slate-200 font-medium">
                      Recurring charges
                    </div>
                    <div className="text-slate-50 font-semibold">
                      {currencyFormat(data.currency, breakdown[1].value)}
                    </div>
                  </div>
                  <div className="text-sm flex justify-between">
                    <div className="text-slate-200 font-medium">
                      Usage-based charges
                    </div>
                    <div className="text-slate-50 font-semibold">
                      {currencyFormat(data.currency, breakdown[2].value)}
                    </div>
                  </div>
                  <div className="text-sm flex justify-between">
                    <div className="text-slate-200 font-medium">
                      Application credits
                    </div>
                    <div className="text-slate-50 font-semibold">
                      {currencyFormat(data.currency, breakdown[3].value)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ts}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={TEAL}
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="100%"
                            stopColor={TEAL}
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Tooltip
                        formatter={(val) =>
                          currencyFormat(data.currency, val)
                        }
                        contentStyle={{
                          backgroundColor: "#020617",
                          borderRadius: 6,
                          border: "1px solid #1f2937",
                          color: "#e5e7eb",
                        }}
                        labelStyle={{ color: "#e5e7eb" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={TEAL}
                        fill="url(#g1)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest app history table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-50">
                Latest app history
              </h3>
              <p className="text-[11px] text-slate-400">
                Recent lifecycle events for this app
              </p>
            </div>
            <div className="text-xs sm:text-sm text-slate-400">
              Page {currentPage} / {totalPages}
            </div>
          </div>

          <div className="overflow-x-auto bg-slate-900 rounded-xl shadow-sm border border-slate-800">
            <table className="w-full text-xs sm:text-sm text-slate-100">
              <thead className="text-left uppercase text-[11px] bg-slate-950/80 text-slate-400">
                <tr>
                  <th className="py-3 pr-4 pl-4 sm:pl-6">Date</th>
                  <th className="py-3 pr-4">Store</th>
                  <th className="py-3 pr-4">Event</th>
                  <th className="py-3 pr-4">Event details</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-slate-500"
                    >
                      No recent events
                    </td>
                  </tr>
                )}
                {pageItems.map((row, i) => {
                  const tag = mapEventTag(row.event);
                  return (
                    <tr
                      key={i}
                      className={`border-t border-t-slate-800 ${
                        i % 2 === 0 ? "bg-slate-900" : "bg-slate-800/70"
                      } hover:bg-teal-500/10 transition-colors`}
                    >
                      <td className="py-3 pr-4 pl-4 sm:pl-6 align-top w-48 text-slate-100">
                        {new Date(row.date).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 align-top">
                        {row.store &&
                        row.store.includes("myshopify") ? (
                          <a
                            href={`https://${row.store}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-teal-300 underline"
                          >
                            {row.store}
                          </a>
                        ) : (
                          <span className="text-teal-300 underline">
                            {row.store}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${tag.color}`}
                        >
                          {tag.text}
                        </span>
                      </td>
                      <td className="py-3 pr-4 align-top max-w-2xl">
                        <details>
                          <summary className="cursor-pointer text-teal-300 underline">
                            View details
                          </summary>
                          <pre className="mt-2 p-3 bg-slate-900 rounded border border-slate-800 text-[11px] break-words text-slate-100">
                            {row.details}
                          </pre>
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
            <div className="text-xs sm:text-sm text-slate-400">
              {history.length} total events
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-slate-700 bg-slate-900 text-xs sm:text-sm text-slate-100 disabled:opacity-40"
              >
                Prev
              </button>
              <div className="text-xs sm:text-sm text-slate-200">
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-[#23B5B5] text-white text-xs sm:text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <div className="h-4" />
      </div>
    );
  }

  const appName = app?.name || data?.appName || "Shopify App";
  const initials = (appName || "AM")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const statusLabel =
    normalizeStatus(data?.appStatus) || normalizeStatus(app?.status);
  const statusBadge =
    statusLabel &&
    (statusLabel === "Published"
      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
      : statusLabel === "Submitted"
      ? "bg-amber-500/10 text-amber-300 border border-amber-500/40"
      : "bg-slate-800 text-slate-200 border border-slate-600");

  // Drawer wrapper (overlay + right panel)
  return (
    <div
      className={`fixed inset-0 z-50 flex transition-opacity duration-300 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="w-px bg-slate-900 h-full" aria-hidden="true" />

      {/* Panel */}
      <aside
        className={`relative ml-auto h-full w-[98vw] sm:w-[95vw] lg:w-[86vw] xl:w-[80vw] bg-[#020617] shadow-[0_0_40px_rgba(0,0,0,0.9)] border-l border-slate-800 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header inside drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#23B5B5] text-white flex items-center justify-center text-xs font-semibold shadow-sm">
              {initials}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-50">
                {appName}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center px-2 py-[2px] rounded-full bg-teal-500/10 text-[10px] font-medium text-teal-300 border border-teal-500/40">
                  Shopify App
                </span>
                {statusLabel && (
                  <span
                    className={`inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-medium ${statusBadge}`}
                  >
                    {statusLabel}
                  </span>
                )}
                <p className="text-[11px] text-slate-400">
                  Partner analytics overview
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-full bg-slate-900 text-[11px] font-medium text-slate-200 hover:bg-slate-800 border border-slate-700 transition-all"
          >
            Close
          </button>
        </div>

        {/* Content area */}
        <div className="h-[calc(100%-52px)] overflow-auto px-5 py-4 bg-[#020617]">
          {body}
        </div>
      </aside>
    </div>
  );
}
