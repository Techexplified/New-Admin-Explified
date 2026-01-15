import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const LandingTab = ({
  landingChartData,
  landingChartSeries,
  landingPagesData,
  fmtDuration,
}) => (
  <>
    <h4 className="text-lg font-semibold mb-1 text-slate-50">Landing pages</h4>
    <div className="text-xs text-slate-400 mb-4">
      Sessions and engagement by landing page.
    </div>

    {landingChartData &&
      landingChartData.length > 0 &&
      landingChartSeries &&
      landingChartSeries.length > 0 && (
        <div className="w-full h-56 mb-4 bg-slate-900 rounded-md p-2 shadow-sm border border-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={landingChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: "#e5e7eb" }} />
              <YAxis tick={{ fill: "#e5e7eb" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderRadius: 6,
                  border: "1px solid #1f2937",
                  color: "#e5e7eb",
                }}
                labelStyle={{ color: "#e5e7eb" }}
              />
              <Legend />
              {landingChartSeries.map((name, idx) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={
                    [
                      "#22c55e",
                      "#0ea5e9",
                      "#f97316",
                      "#6366f1",
                      "#e11d48",
                      "#14b8a6",
                    ][idx % 6]
                  }
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
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
            <th className="px-2 py-2 text-left w-[32%]">Landing page</th>
            <th className="px-2 py-2 text-right">Sessions</th>
            <th className="px-2 py-2 text-right">Active users</th>
            <th className="px-2 py-2 text-right">New users</th>
            <th className="px-2 py-2 text-right">Avg. engagement</th>
            <th className="px-2 py-2 text-right">Key events</th>
            <th className="px-2 py-2 text-right">Session event rate</th>
          </tr>
        </thead>
        <tbody>
          {landingPagesData.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-2 py-6 text-center text-slate-500">
                No landing page data available.
              </td>
            </tr>
          ) : (
            landingPagesData.map((row, i) => (
              <tr
                key={i}
                className={`transition-all duration-150 hover:bg-teal-500/10 ${
                  i % 2 === 0 ? "bg-slate-900" : "bg-slate-800/80"
                }`}
              >
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    aria-label={`select ${row.landingPage}`}
                  />
                </td>
                <td className="px-2 py-2 font-mono text-slate-100 truncate max-w-[30ch]">
                  {row.landingPage}
                </td>
                <td className="px-2 py-2 text-right">
                  <div className="font-semibold text-slate-50">
                    {row.sessions.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {row.sessionsPct
                      ? `${row.sessionsPct.toFixed(2)}%`
                      : "0% of total"}
                  </div>
                </td>
                <td className="px-2 py-2 text-right">
                  <div className="font-semibold text-slate-50">
                    {row.activeUsers.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {row.activeUsersPct
                      ? `${row.activeUsersPct.toFixed(2)}%`
                      : "0% of total"}
                  </div>
                </td>
                <td className="px-2 py-2 text-right">
                  <div className="font-semibold text-slate-50">
                    {row.newUsers.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {row.newUsersPct ? `${row.newUsersPct.toFixed(2)}%` : "0%"}
                  </div>
                </td>
                <td className="px-2 py-2 text-right">
                  {fmtDuration(row.averageSessionDuration)}
                </td>
                <td className="px-2 py-2 text-right">
                  {row.eventCount.toLocaleString()}
                </td>
                <td className="px-2 py-2 text-right">
                  {row.sessionEventRate
                    ? `${row.sessionEventRate.toFixed(0)}%`
                    : "0%"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </>
);

export default LandingTab;
