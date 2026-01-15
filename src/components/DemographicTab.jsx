import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TEAL = "#23B5B5";

const DemographicTab = ({ countryChartData, countryData, fmtDuration }) => (
  <>
    <h4 className="text-lg font-semibold mb-1 text-slate-50">
      Demographics – countries
    </h4>
    <div className="text-xs text-slate-400 mb-4">
      Active users by country (last 7 days).
    </div>

    {countryChartData && countryChartData.length > 0 && (
      <div className="w-full h-56 mb-4 bg-slate-900 rounded-md p-2 shadow-sm border border-slate-800">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={countryChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" tick={{ fill: "#e5e7eb" }} />
            <YAxis
              type="category"
              dataKey="country"
              width={180}
              tick={{ fill: "#e5e7eb" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderRadius: 6,
                border: "1px solid #1f2937",
                color: "#e5e7eb",
              }}
              labelStyle={{ color: "#e5e7eb" }}
            />
            <Bar dataKey="activeUsers" fill={TEAL} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}

    <div className="overflow-auto">
      <table className="w-full table-fixed border-collapse text-slate-100 text-xs sm:text-sm">
        <thead className="sticky top-0 bg-slate-900/95 backdrop-blur">
          <tr className="uppercase text-[11px] font-semibold tracking-wide text-slate-400">
            <th className="px-2 py-2 text-left w-6">
              <input type="checkbox" aria-label="select all" />
            </th>
            <th className="px-2 py-2 text-left w-[30%]">Country</th>
            <th className="px-2 py-2 text-right">Active users</th>
            <th className="px-2 py-2 text-right">New users</th>
            <th className="px-2 py-2 text-right">Engaged sessions</th>
            <th className="px-2 py-2 text-right">Engagement rate</th>
            <th className="px-2 py-2 text-right">Engaged / active</th>
            <th className="px-2 py-2 text-right">Avg. engagement</th>
            <th className="px-2 py-2 text-right">Event count</th>
          </tr>
        </thead>
        <tbody>
          {countryData.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-2 py-6 text-center text-slate-500">
                No country data available.
              </td>
            </tr>
          ) : (
            countryData.map((c, i) => (
              <tr
                key={i}
                className={`transition-all duration-150 hover:bg-teal-500/10 ${
                  i % 2 === 0 ? "bg-slate-900" : "bg-slate-800/80"
                }`}
              >
                <td className="px-2 py-2">
                  <input type="checkbox" aria-label={`select ${c.country}`} />
                </td>
                <td className="px-2 py-2 font-mono text-slate-100">
                  {c.country}
                </td>
                <td className="px-2 py-2 text-right font-semibold text-slate-50">
                  {c.activeUsers.toLocaleString()}
                  <div className="text-[11px] text-slate-400">
                    {c.activeUsersPct
                      ? `${c.activeUsersPct.toFixed(2)}%`
                      : "0%"}
                  </div>
                </td>
                <td className="px-2 py-2 text-right">
                  {c.newUsers.toLocaleString()}
                </td>
                <td className="px-2 py-2 text-right">
                  {c.engagedSessions.toLocaleString()}
                </td>
                <td className="px-2 py-2 text-right">
                  {c.engagedRate ? `${c.engagedRate.toFixed(2)}%` : "0%"}
                </td>
                <td className="px-2 py-2 text-right">
                  {c.engagedPerActive ? c.engagedPerActive.toFixed(2) : "0"}
                </td>
                <td className="px-2 py-2 text-right">
                  {fmtDuration(c.averageSessionDuration)}
                </td>
                <td className="px-2 py-2 text-right">
                  {c.eventCount.toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </>
);

export default DemographicTab;
