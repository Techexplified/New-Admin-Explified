import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";

const Extensions = () => {
  const [range, setRange] = useState("7d");
  const [query, setQuery] = useState("");
  const metrics = useMemo(() => {
    // Dummy aggregated metrics per selected range
    if (range === "7d") {
      return {
        users: 18600,
        sessions: 15340,
        bounceRate: 38.4,
        avgSessionSec: 212,
        trend: [120, 140, 165, 150, 170, 190, 210],
      };
    }
    if (range === "30d") {
      return {
        users: 72000,
        sessions: 61000,
        bounceRate: 36.1,
        avgSessionSec: 238,
        trend: [90, 110, 130, 150, 170, 190, 210, 230, 250, 270],
      };
    }
    // default
    return {
      users: 18600,
      sessions: 15340,
      bounceRate: 38.4,
      avgSessionSec: 212,
      trend: [120, 140, 165, 150, 170, 190, 210],
    };
  }, [range]);

  const extensions = [
    { name: "Youtube Summarizer", users: 11540, sessions: 9800, share: 63.9 },
    { name: "Ai image styler", users: 4200, sessions: 3700, share: 21.6 },
    { name: "Ai blog generator", users: 1500, sessions: 1200, share: 7.1 },
    { name: "Video meme generator", users: 800, sessions: 630, share: 3.9 },
    { name: "Other", users: 560, sessions: 410, share: 3.5 },
  ];

  const filtered = extensions.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));

  // totalShare not required with recharts
  const pieData = extensions.map((e) => ({ name: e.name, value: e.share }));
  const lineData = metrics.trend.map((v, i) => ({ name: `${i}`, value: v }));
  const barData = extensions.map((e) => ({ name: e.name, sessions: e.sessions }));

  const fmtSeconds = (s) => {
    if (!s) return "0s";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Extensions analytics</h1>
          <p className="text-sm text-gray-500">Overview of extension usage</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search extensions..."
              className="w-full md:w-64 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-label="Search extensions"
            />
          </div>

          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setRange("7d")}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border  ${
                range === "7d" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setRange("30d")}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border  ${
                range === "30d" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              30d
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-2 bg-white border rounded-md text-sm hover:bg-indigo-50 transition">
              Export
            </button>
            <button className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition">
              Compare
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition">
          <div className="text-sm text-gray-500">Users</div>
          <div className="text-2xl font-semibold text-gray-900">{metrics.users.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1">+4.2% vs previous</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition">
          <div className="text-sm text-gray-500">Sessions</div>
          <div className="text-2xl font-semibold text-gray-900">{metrics.sessions.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1">+2.8% vs previous</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition">
          <div className="text-sm text-gray-500">Avg. session</div>
          <div className="text-xl font-semibold text-gray-900">{fmtSeconds(metrics.avgSessionSec)}</div>
          <div className="text-xs text-gray-500 mt-2">Bounce rate: <span className="text-red-600">{metrics.bounceRate}%</span></div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow flex flex-col items-center justify-center">
          <div className="text-sm text-gray-500">Share distribution</div>
          <div className="w-28 h-28 mt-2">
            <ResponsiveContainer width="100%" height={112}>
              <PieChart>
                <Pie dataKey="value" data={pieData} innerRadius={28} outerRadius={45} paddingAngle={2}>
                  {pieData.map((entry, index) => {
                    const colors = ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444", "#9ca3af"];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-gray-600 mt-2">Top: {extensions[0].name}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Top extensions</h3>
            <div className="text-xs text-gray-500">Sessions (mini-bar)</div>
          </div>
          <div className="mb-3">
            <div style={{ width: "100%", height: 80 }}>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={barData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: 6 }} />
                  <Bar dataKey="sessions" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="pb-2">Extension</th>
                  <th className="pb-2">Users</th>
                  <th className="pb-2">Sessions</th>
                  <th className="pb-2">Share</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.name} className="border-t hover:bg-gray-50 transition">
                    <td className="py-3 font-medium">{b.name}</td>
                    <td className="py-3">{b.users.toLocaleString()}</td>
                    <td className="py-3">{b.sessions.toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-36 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div style={{ width: `${b.share}%` }} className="h-2 bg-indigo-500 rounded-full" />
                        </div>
                        <div className="text-xs text-gray-600">{b.share}%</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 bg-white border rounded text-sm hover:bg-indigo-50">View</button>
                        <button className="px-2 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">Compare</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Overview</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <div className="text-gray-500">Total Users</div>
              <div className="font-medium text-gray-900">{metrics.users.toLocaleString()}</div>
            </div>
            <div className="flex justify-between text-sm">
              <div className="text-gray-500">Sessions</div>
              <div className="font-medium text-gray-900">{metrics.sessions.toLocaleString()}</div>
            </div>
            <div className="flex justify-between text-sm">
              <div className="text-gray-500">Bounce rate</div>
              <div className="font-medium text-gray-900">{metrics.bounceRate}%</div>
            </div>
            <div className="flex justify-between text-sm">
              <div className="text-gray-500">Avg. session</div>
              <div className="font-medium text-gray-900">{fmtSeconds(metrics.avgSessionSec)}</div>
            </div>
            <div className="pt-2">
              <div className="text-xs text-gray-500 mb-2">Trend</div>
              <div style={{ width: "100%", height: 60 }}>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={lineData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: 6 }} />
                    <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Extensions;