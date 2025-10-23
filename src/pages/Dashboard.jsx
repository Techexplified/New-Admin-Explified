import React, { useEffect, useState } from "react";
import { useSelector} from "react-redux";
// import { logout } from "../redux/authSlice"; // Adjust path
import { useNavigate } from "react-router-dom";
import { gapi } from "gapi-script";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const GA4_PROPERTY_ID = "489164789";

const Dashboard = () => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  // const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeUsersData, setActiveUsersData] = useState([]);
  const [summary, setSummary] = useState({ activeUsers: 0, newUsers: 0, eventCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }

    const initGapiAndFetch = async () => {
      try {
        await gapi.load("client:auth2", async () => {
          await gapi.client.init({
            discoveryDocs: ["https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta"],
            token,
          });

          await fetchGA4Data();
        });
      } catch (err) {
        setError("Failed to initialize Google API: " + err.message);
        setLoading(false);
      }
    };

    const fetchGA4Data = async () => {
      setLoading(true);
      try {
        gapi.client.setToken({ access_token: token });

        const activeUsersResp = await gapi.client.analyticsdata.properties.runReport({
          property: `properties/${GA4_PROPERTY_ID}`,
          dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "activeUsers" }],
        });

        const chartData =
          activeUsersResp.result.rows?.map((row) => ({
            date: row.dimensionValues[0].value,
            activeUsers: parseInt(row.metricValues[0].value),
          })) || [];

        setActiveUsersData(chartData);

        const summaryResp = await gapi.client.analyticsdata.properties.runReport({
          property: `properties/${GA4_PROPERTY_ID}`,
          dateRanges: [{ startDate: "2daysAgo", endDate: "today" }],
          metrics: [
            { name: "activeUsers" },
            { name: "newUsers" },
            { name: "eventCount" },
          ],
        });

        const metrics = summaryResp.result.rows?.[0]?.metricValues || [];
        setSummary({
          activeUsers: parseInt(metrics[0]?.value || 0),
          newUsers: parseInt(metrics[1]?.value || 0),
          eventCount: parseInt(metrics[2]?.value || 0),
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch GA4 data: " + err.message);
        setLoading(false);
      }
    };

    initGapiAndFetch();
  }, [isAuthenticated, token, navigate]);

  // const handleSignOut = () => {
  //   dispatch(logout());
  //   navigate("/login");
  // };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">
        Loading data...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-600 text-center p-6 space-y-4">
        <p>❌ {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-gray-900 transition"
        >
          Reload
        </button>
      </div>
    );

  return (
    <div className="min-h-screen  font-sans p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-semibold font-serif text-gray-900 flex items-center gap-3">
          📊 Explified Analytics Dashboard
        </h1>
        {/* <button
          onClick={handleSignOut}
          className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow transition flex items-center gap-2"
          aria-label="Sign Out"
        >
          🚪 Sign Out
        </button> */}
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
        <Card title="🟢 Active Users (48h)" value={summary.activeUsers} color="text-green-500" />
        <Card title="🆕 New Users (7d)" value={summary.newUsers} color="text-blue-500" />
        <Card title="📥 Total Events (7d)" value={summary.eventCount} color="text-purple-500" />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        <ChartCard title="Active Users (Last 7 Days)" data={activeUsersData} type="line" />
        <ChartCard title="Active Users (Bar Chart)" data={activeUsersData} type="bar" />
      </section>

      {/* Data Table */}
      <section className="bg-white shadow-xl rounded-xl p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b border-gray-200 pb-2">
          Active Users (Raw Data)
        </h2>
        <table className="min-w-full table-auto border-collapse text-gray-800">
          <thead>
            <tr className="bg-gray-100 uppercase text-sm font-semibold tracking-wider">
              <th className="border border-gray-300 px-5 py-3 text-left">Date</th>
              <th className="border border-gray-300 px-5 py-3 text-left">Active Users</th>
            </tr>
          </thead>
          <tbody>
            {activeUsersData.map((row, i) => (
              <tr
                key={i}
                className={`${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-indigo-100 transition cursor-default`}
              >
                <td className="border border-gray-300 px-5 py-3 font-mono">
                  {`${row.date.slice(0, 4)}-${row.date.slice(4, 6)}-${row.date.slice(6)}`}
                </td>
                <td className="border border-gray-300 px-5 py-3 font-semibold">{row.activeUsers.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div className="bg-white shadow-lg rounded-xl p-6 flex items-center space-x-6 hover:shadow-2xl transition cursor-default">
    <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 ${color} text-3xl select-none`}>
      ⬤
    </div>
    <div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-4xl font-extrabold text-gray-900">{value.toLocaleString()}</p>
    </div>
  </div>
);

const ChartCard = ({ title, data, type }) => (
  <div className="bg-white shadow-lg rounded-xl p-6">
    <h2 className="text-xl font-semibold mb-4 text-gray-900">{title}</h2>
    <ResponsiveContainer width="100%" height={320}>
      {type === "line" ? (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis dataKey="date" tick={{ fill: "#4b5563" }} />
          <YAxis tick={{ fill: "#4b5563" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#f3f4f6", borderRadius: 8 }}
            cursor={{ stroke: "#a5b4fc", strokeWidth: 2 }}
          />
          <Line type="monotone" dataKey="activeUsers" stroke="#6366f1" strokeWidth={3} dot={{ r: 6 }} />
        </LineChart>
      ) : (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis dataKey="date" tick={{ fill: "#4b5563" }} />
          <YAxis tick={{ fill: "#4b5563" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#f3f4f6", borderRadius: 8 }}
            cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
          />
          <Bar dataKey="activeUsers" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  </div>
);

export default Dashboard;
