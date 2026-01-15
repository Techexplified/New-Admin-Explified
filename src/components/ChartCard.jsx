import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TEAL = "#23B5B5";
const TEAL_DARK = "#1B8F8F";

const ChartCard = ({
  title,
  data = [],
  dataKey = "activeUsers",
  formatter,
}) => (
  <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-sm hover:shadow-lg transition-all duration-150 px-4 py-4 sm:px-5 sm:py-5">
    <h2 className="text-sm sm:text-base font-semibold mb-3 text-slate-50">
      {title}
    </h2>
    <div className="w-full h-60 sm:h-64">
      {!data || data.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          <div className="text-center">
            <div className="h-3 w-40 bg-slate-700 rounded-full mb-3 animate-pulse" />
            <div className="text-xs">No data available</div>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderRadius: 8,
                border: "1px solid #1f2937",
                boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
                color: "#e5e7eb",
              }}
              cursor={{ stroke: TEAL, strokeWidth: 2 }}
              formatter={formatter}
              labelStyle={{ color: "#e5e7eb" }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={TEAL}
              strokeWidth={3}
              dot={{ r: 3, stroke: "#0f172a", strokeWidth: 1 }}
              activeDot={{ r: 5, stroke: TEAL_DARK, strokeWidth: 1.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);

export default ChartCard;
