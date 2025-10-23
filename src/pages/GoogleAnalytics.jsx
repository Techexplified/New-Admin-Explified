import React, { useEffect, useRef, useState } from "react";
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

// 🔑 Replace these with your own credentials
const CLIENT_ID = "111257695819-t9s3l45puasgo9l82hoo216b8ebtc0hq.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/analytics.readonly";
const GA4_PROPERTY_ID = "489164789";

export default function GoogleAnalytics() {
  const [token, setToken] = useState(null);
  const [activeUsersData, setActiveUsersData] = useState([]);
  const [summary, setSummary] = useState({ activeUsers: 0, newUsers: 0, eventCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tokenClientRef = useRef(null);
  const googleButtonRef = useRef(null);

  // ✅ Load scripts safely before initializing
  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) return resolve();

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
      });

    const init = async () => {
      try {
        // Load required scripts first
        await loadScript("https://apis.google.com/js/api.js");
        await loadScript("https://accounts.google.com/gsi/client");

        // Wait until gapi is ready
        await new Promise((resolve) => gapi.load("client", resolve));

        // Initialize gapi client for GA4 Data API
        await gapi.client.init({
          discoveryDocs: ["https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta"],
        });

        // Ensure GIS client is ready
        if (!window.google?.accounts?.oauth2) {
          throw new Error("Google Identity Services (GIS) failed to load.");
        }

        // Initialize OAuth2 token client
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (resp) => {
            if (resp.error) {
              console.error("OAuth Error:", resp);
              setError(resp.error);
              return;
            }
            setToken(resp.access_token);
          },
        });

        // Render Google Sign-In button
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: () => {}, // Not used here
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize: " + (err?.message || JSON.stringify(err)));
        setLoading(false);
      }
    };

    init();
  }, []);

  // ✅ Fetch data automatically once token is available
  useEffect(() => {
    if (token) {
      fetchGA4Data();
    }
  }, [token]);

  const requestAccessToken = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken();
    } else {
      setError("Token client not ready. Try reloading the page.");
    }
  };

  const fetchGA4Data = async () => {
    try {
      // Fetch daily active users for last 7 days
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

      // Fetch summary metrics
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
    } catch (err) {
      console.error("Error fetching GA4 data:", err);
      setError("Failed to fetch GA4 data: " + (err?.message || JSON.stringify(err)));
    }
  };

  const signOut = () => {
    setToken(null);
    setActiveUsersData([]);
    setSummary({ activeUsers: 0, newUsers: 0, eventCount: 0 });
  };

  // ✅ Render UI
  if (loading) return <div className="text-center p-10">Loading Google API...</div>;
  if (error) return <div className="text-red-500 text-center p-4">❌ {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
        📊 Google Analytics 4 Dashboard
      </h1>

      {!token ? (
        <div className="text-center">
          <div ref={googleButtonRef} className="inline-block"></div>
          <p className="mt-6 text-gray-600">Or</p>
          <button
            onClick={requestAccessToken}
            className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
          >
            Continue with Google
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-6">
            <button
              onClick={signOut}
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow transition"
            >
              🚪 Sign Out
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
            <Card title="🟢 Active Users (48h)" value={summary.activeUsers} color="text-green-500" />
            <Card title="🆕 New Users (7d)" value={summary.newUsers} color="text-blue-500" />
            <Card title="📥 Total Events (7d)" value={summary.eventCount} color="text-purple-500" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            <ChartCard title="Active Users (Last 7 Days)" data={activeUsersData} type="line" />
            <ChartCard title="Event Count (Last 7 Days)" data={activeUsersData} type="bar" />
          </div>

          {/* Data Table */}
          <div className="bg-white shadow-lg rounded-xl p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Active Users (Raw Data)</h2>
            <table className="min-w-full border-collapse table-auto">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold tracking-wider">
                  <th className="border border-gray-300 px-4 py-3 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Active Users</th>
                </tr>
              </thead>
              <tbody>
                {activeUsersData.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-4 py-3">
                      {row.date.slice(0, 4)}-{row.date.slice(4, 6)}-{row.date.slice(6)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">{row.activeUsers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// 🧩 Small helper components
function Card({ title, value, color }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 flex items-center space-x-6 hover:shadow-xl transition cursor-default">
      <div className={`w-10 h-10 ${color}`}>⬤</div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-4xl font-extrabold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, data, type }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      <ResponsiveContainer width="100%" height={320}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280" }} />
            <YAxis tick={{ fill: "#6b7280" }} />
            <Tooltip contentStyle={{ backgroundColor: "#f9fafb", borderRadius: 8 }} />
            <Line type="monotone" dataKey="activeUsers" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280" }} />
            <YAxis tick={{ fill: "#6b7280" }} />
            <Tooltip contentStyle={{ backgroundColor: "#f9fafb", borderRadius: 8 }} />
            <Bar dataKey="activeUsers" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
