import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { gapi } from "gapi-script";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";


const GA4_PROPERTY_ID = "489164789";

const Dashboard = () => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeUsersData, setActiveUsersData] = useState([]);
  const [timeseriesData, setTimeseriesData] = useState([]);
  const [filter, setFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerActive, setDrawerActive] = useState(false);
  const [summary, setSummary] = useState({
    activeUsers: 0,
    newUsers: 0,
    eventCount: 0,
    sessions: 0,
    totalUsers: 0,
    averageSessionDuration: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [landingPagesData, setLandingPagesData] = useState([]);
  const [landingChartData, setLandingChartData] = useState([]);
  const [landingChartSeries, setLandingChartSeries] = useState([]);
  const [panelTab, setPanelTab] = useState('Landing');
  const [browserData, setBrowserData] = useState([]);
  const [browserChartData, setBrowserChartData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [countryChartData, setCountryChartData] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [trafficChartData, setTrafficChartData] = useState([]);
  const [trafficChartSeries, setTrafficChartSeries] = useState([]);

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

        const multiResp = await gapi.client.analyticsdata.properties.runReport({
          property: `properties/${GA4_PROPERTY_ID}`,
          dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "averageSessionDuration" },
          ],
        });

        const chartData =
          multiResp.result.rows?.map((row) => ({
            date: row.dimensionValues[0].value,
            activeUsers: parseInt(row.metricValues[0].value || 0),
            sessions: parseInt(row.metricValues[1].value || 0),
            totalUsers: parseInt(row.metricValues[2].value || 0),
            averageSessionDuration: parseFloat(row.metricValues[3].value || 0),
          })) || [];

        const sorted = chartData.slice().sort((a, b) => a.date.localeCompare(b.date));
        setActiveUsersData(sorted);
        setTimeseriesData(sorted);

        const summaryResp = await gapi.client.analyticsdata.properties.runReport({
          property: `properties/${GA4_PROPERTY_ID}`,
          dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
          metrics: [
            { name: "activeUsers" },
            { name: "newUsers" },
            { name: "eventCount" },
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "averageSessionDuration" },
          ],
        });

        const metrics = summaryResp.result.rows?.[0]?.metricValues || [];
        setSummary({
          activeUsers: parseInt(metrics[0]?.value || 0),
          newUsers: parseInt(metrics[1]?.value || 0),
          eventCount: parseInt(metrics[2]?.value || 0),
          sessions: parseInt(metrics[3]?.value || 0),
          totalUsers: parseInt(metrics[4]?.value || 0),
          averageSessionDuration: parseFloat(metrics[5]?.value || 0),
        });

        try {
          const landingResp = await gapi.client.analyticsdata.properties.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
            dimensions: [{ name: "landingPage" }],
            metrics: [
              { name: "sessions" },
              { name: "activeUsers" },
              { name: "newUsers" },
              { name: "averageSessionDuration" },
              { name: "eventCount" },
              { name: "totalUsers" },
              { name: "purchaseRevenue" },
            ],
            limit: 200,
          });

          const lpRows = landingResp.result.rows || [];
          const parsed = lpRows.map((r) => ({
            landingPage: r.dimensionValues?.[0]?.value || "(not set)",
            sessions: parseInt(r.metricValues?.[0]?.value || 0),
            activeUsers: parseInt(r.metricValues?.[1]?.value || 0),
            newUsers: parseInt(r.metricValues?.[2]?.value || 0),
            averageSessionDuration: parseFloat(r.metricValues?.[3]?.value || 0),
            eventCount: parseInt(r.metricValues?.[4]?.value || 0),
            totalUsers: parseInt(r.metricValues?.[5]?.value || 0),
            revenue: parseFloat(r.metricValues?.[6]?.value || 0),
          }));

          const totals = parsed.reduce(
            (acc, cur) => {
              acc.sessions += cur.sessions;
              acc.activeUsers += cur.activeUsers;
              acc.newUsers += cur.newUsers;
              acc.eventCount += cur.eventCount;
              acc.revenue += cur.revenue;
              return acc;
            },
            { sessions: 0, activeUsers: 0, newUsers: 0, eventCount: 0, revenue: 0 }
          );

          const withPct = parsed.map((p) => ({
            ...p,
            sessionsPct: totals.sessions ? (p.sessions / totals.sessions) * 100 : 0,
            activeUsersPct: totals.activeUsers ? (p.activeUsers / totals.activeUsers) * 100 : 0,
            newUsersPct: totals.newUsers ? (p.newUsers / totals.newUsers) * 100 : 0,
            sessionEventRate: p.sessions ? (p.eventCount / p.sessions) * 100 : 0,
          }));

          // Keep the landing pages table to the top 25 pages
          const TOP_PAGES_COUNT = 25;
          setLandingPagesData(withPct.slice(0, TOP_PAGES_COUNT));

          // build a sessions-by-landing-page timeseries for the top N landing pages
          try {
            // Build top pages list. We fetch top 25 for the table but only show
            // the top 6 in the timeseries chart for readability.
            const TOP_PAGES_COUNT = 25;
            const TOP_CHART_PAGES = 6;
            const topPagesAll = parsed.slice().sort((a, b) => b.sessions - a.sessions).slice(0, TOP_PAGES_COUNT).map(p => p.landingPage);
            const topChartPages = topPagesAll.slice(0, TOP_CHART_PAGES);
            setLandingChartSeries(topChartPages);

            // fetch date+landingPage sessions for the last 30 days
            const timesResp = await gapi.client.analyticsdata.properties.runReport({
              property: `properties/${GA4_PROPERTY_ID}`,
              dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
              dimensions: [{ name: "date" }, { name: "landingPage" }],
              metrics: [{ name: "sessions" }],
              limit: 100000,
            });

            const tRows = timesResp.result.rows || [];
            // map by date-key (YYYYMMDD) to landing page sessions
            const map = {};
            tRows.forEach(r => {
              const dateKey = r.dimensionValues?.[0]?.value;
              const lp = r.dimensionValues?.[1]?.value || '(not set)';
              const sessions = parseInt(r.metricValues?.[0]?.value || 0);
              if (!topChartPages.includes(lp)) return; // only keep top chart pages for timeseries
              map[dateKey] = map[dateKey] || {};
              map[dateKey][lp] = sessions;
            });

            // create a contiguous date range for the last 30 days
            const days = 30;
            const dates = [];
            for (let i = days; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              const key = `${y}${m}${day}`; // matches GA date dimension format
              const label = `${y}-${m}-${day}`;
              dates.push({ key, label });
            }

            const chartData = dates.map(({ key, label }) => {
              const obj = { date: label };
              topChartPages.forEach(name => {
                obj[name] = map[key] && typeof map[key][name] !== 'undefined' ? map[key][name] : 0;
              });
              return obj;
            });

            setLandingChartData(chartData);
          } catch (e) {
            console.warn('Failed to fetch landing timeseries:', e);
            setLandingChartData([]);
            setLandingChartSeries([]);
          }

          // fetch browser breakdown (summary + chart) for Browser tab
          try {
            const browserResp = await gapi.client.analyticsdata.properties.runReport({
              property: `properties/${GA4_PROPERTY_ID}`,
              dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
              dimensions: [{ name: "browser" }],
              metrics: [
                { name: "activeUsers" },
                { name: "newUsers" },
                { name: "engagedSessions" },
                { name: "sessions" },
                { name: "averageSessionDuration" },
                { name: "eventCount" },
              ],
              limit: 50,
            });

            const bRows = browserResp.result.rows || [];
            const browsers = bRows.map((r) => ({
              browser: r.dimensionValues?.[0]?.value || '(not set)',
              activeUsers: parseInt(r.metricValues?.[0]?.value || 0),
              newUsers: parseInt(r.metricValues?.[1]?.value || 0),
              engagedSessions: parseInt(r.metricValues?.[2]?.value || 0),
              sessions: parseInt(r.metricValues?.[3]?.value || 0),
              averageSessionDuration: parseFloat(r.metricValues?.[4]?.value || 0),
              eventCount: parseInt(r.metricValues?.[5]?.value || 0),
            }));

            const totalsB = browsers.reduce((acc, cur) => {
              acc.activeUsers += cur.activeUsers;
              acc.newUsers += cur.newUsers;
              acc.engagedSessions += cur.engagedSessions;
              acc.sessions += cur.sessions;
              acc.eventCount += cur.eventCount;
              return acc;
            }, { activeUsers: 0, newUsers: 0, engagedSessions: 0, sessions: 0, eventCount: 0 });

            const withDerived = browsers.map((b) => ({
              ...b,
              activeUsersPct: totalsB.activeUsers ? (b.activeUsers / totalsB.activeUsers) * 100 : 0,
              engagedRate: b.sessions ? (b.engagedSessions / b.sessions) * 100 : 0,
              engagedPerActive: b.activeUsers ? b.engagedSessions / b.activeUsers : 0,
            }));

            setBrowserData(withDerived);
            // chart data: top browsers by activeUsers
            setBrowserChartData(withDerived.slice().sort((a,b)=>b.activeUsers-a.activeUsers));
          } catch (be) {
            console.warn('Failed to fetch browser data:', be);
            setBrowserData([]);
            setBrowserChartData([]);
          }

          // fetch country breakdown (Demographic tab)
          try {
            const countryResp = await gapi.client.analyticsdata.properties.runReport({
              property: `properties/${GA4_PROPERTY_ID}`,
              dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
              dimensions: [{ name: "country" }],
              metrics: [
                { name: "activeUsers" },
                { name: "newUsers" },
                { name: "engagedSessions" },
                { name: "sessions" },
                { name: "averageSessionDuration" },
                { name: "eventCount" },
              ],
              limit: 250,
            });

            const cRows = countryResp.result.rows || [];
            const countries = cRows.map((r) => ({
              country: r.dimensionValues?.[0]?.value || '(not set)',
              activeUsers: parseInt(r.metricValues?.[0]?.value || 0),
              newUsers: parseInt(r.metricValues?.[1]?.value || 0),
              engagedSessions: parseInt(r.metricValues?.[2]?.value || 0),
              sessions: parseInt(r.metricValues?.[3]?.value || 0),
              averageSessionDuration: parseFloat(r.metricValues?.[4]?.value || 0),
              eventCount: parseInt(r.metricValues?.[5]?.value || 0),
            }));

            const totalsC = countries.reduce((acc, cur) => {
              acc.activeUsers += cur.activeUsers;
              acc.newUsers += cur.newUsers;
              acc.engagedSessions += cur.engagedSessions;
              acc.sessions += cur.sessions;
              acc.eventCount += cur.eventCount;
              return acc;
            }, { activeUsers: 0, newUsers: 0, engagedSessions: 0, sessions: 0, eventCount: 0 });

            const withDerivedC = countries.map((c) => ({
              ...c,
              activeUsersPct: totalsC.activeUsers ? (c.activeUsers / totalsC.activeUsers) * 100 : 0,
              engagedRate: c.sessions ? (c.engagedSessions / c.sessions) * 100 : 0,
              engagedPerActive: c.activeUsers ? c.engagedSessions / c.activeUsers : 0,
            }));

            setCountryData(withDerivedC);
            setCountryChartData(withDerivedC.slice().sort((a,b)=>b.activeUsers-a.activeUsers));
          } catch (ce) {
            console.warn('Failed to fetch country data:', ce);
            setCountryData([]);
            setCountryChartData([]);
          }

          // fetch traffic acquisition (channel grouping) for Traffic tab
          try {
            const trafficResp = await gapi.client.analyticsdata.properties.runReport({
              property: `properties/${GA4_PROPERTY_ID}`,
              dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
              // GA4 dimension for channel grouping (session default channel grouping)
              dimensions: [{ name: "sessionDefaultChannelGroup" }],
              metrics: [
                { name: "sessions" },
                { name: "engagedSessions" },
                { name: "eventCount" },
                { name: "averageSessionDuration" },
              ],
              limit: 250,
            });

            const trRows = trafficResp.result.rows || [];
            const trafficParsed = trRows.map((r) => ({
              channel: r.dimensionValues?.[0]?.value || '(not set)',
              sessions: parseInt(r.metricValues?.[0]?.value || 0),
              engagedSessions: parseInt(r.metricValues?.[1]?.value || 0),
              eventCount: parseInt(r.metricValues?.[2]?.value || 0),
              averageSessionDuration: parseFloat(r.metricValues?.[3]?.value || 0),
            }));

            // Ensure specific channel buckets are present even if GA didn't return them
            // so the UI shows 'Organic Social' and 'Unassigned' rows
            const requiredChannels = ['Organic Social', 'Unassigned'];
            requiredChannels.forEach((name) => {
              if (!trafficParsed.some((t) => t.channel === name)) {
                trafficParsed.push({
                  channel: name,
                  sessions: 0,
                  engagedSessions: 0,
                  eventCount: 0,
                  averageSessionDuration: 0,
                });
              }
            });

            // derive additional metrics
            const trafficWithDerived = trafficParsed.map((t) => ({
              ...t,
              engagementRate: t.sessions ? (t.engagedSessions / t.sessions) * 100 : 0,
              eventsPerSession: t.sessions ? t.eventCount / t.sessions : 0,
            }));

            // keep top 25 for table
            const TOP_TRAFFIC_COUNT = 25;
            setTrafficData(trafficWithDerived.slice(0, TOP_TRAFFIC_COUNT));

            // build timeseries for top channels (top 6 for chart)
            const TOP_CHART = 6;
            const topChannelsAll = trafficWithDerived.slice().sort((a,b)=>b.sessions-a.sessions).slice(0, TOP_TRAFFIC_COUNT).map(p => p.channel);
            const topChartChannels = topChannelsAll.slice(0, TOP_CHART);
            setTrafficChartSeries(topChartChannels);

            const timesResp2 = await gapi.client.analyticsdata.properties.runReport({
              property: `properties/${GA4_PROPERTY_ID}`,
              dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
              dimensions: [{ name: "date" }, { name: "sessionDefaultChannelGroup" }],
              metrics: [{ name: "sessions" }],
              limit: 100000,
            });

            const t2Rows = timesResp2.result.rows || [];
            const map2 = {};
            t2Rows.forEach(r => {
              const dateKey = r.dimensionValues?.[0]?.value;
              const ch = r.dimensionValues?.[1]?.value || '(not set)';
              const sessions = parseInt(r.metricValues?.[0]?.value || 0);
              if (!topChartChannels.includes(ch)) return; // only timeseries for chart channels
              map2[dateKey] = map2[dateKey] || {};
              map2[dateKey][ch] = sessions;
            });

            // build contiguous 30-day series
            const days2 = 30;
            const dates2 = [];
            for (let i = days2; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              const key = `${y}${m}${day}`;
              const label = `${y}-${m}-${day}`;
              dates2.push({ key, label });
            }

            const trafficChart = dates2.map(({ key, label }) => {
              const obj = { date: label };
              topChartChannels.forEach(name => {
                obj[name] = map2[key] && typeof map2[key][name] !== 'undefined' ? map2[key][name] : 0;
              });
              return obj;
            });

            setTrafficChartData(trafficChart);
          } catch (te) {
            console.warn('Failed to fetch traffic acquisition data:', te);
            setTrafficData([]);
            setTrafficChartData([]);
            setTrafficChartSeries([]);
          }
        } catch (lpErr) {
          console.warn("Failed to fetch landing pages data:", lpErr);
          setLandingPagesData([]);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch GA4 data: " + err.message);
        setLoading(false);
      }
    };

    initGapiAndFetch();
  }, [isAuthenticated, token, navigate]);

  useEffect(() => {
    let t;
    if (drawerOpen) {
      t = setTimeout(() => setDrawerActive(true), 20);
    } else {
      setDrawerActive(false);
    }
    return () => clearTimeout(t);
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && drawerOpen) {
        setDrawerActive(false);
        setTimeout(() => setDrawerOpen(false), 300);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const closeDrawer = () => {
    setDrawerActive(false);
    setTimeout(() => setDrawerOpen(false), 300);
  };

  const fmtDuration = (secs) => {
    if (!secs || secs <= 0) return "0s";
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

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
          className="px-6 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-gray-900 transition-all duration-200 hover:scale-105"
        >
          Reload
        </button>
      </div>
    );

  return (
    <div className="min-h-screen font-sans p-8 max-w-6xl mx-auto bg-gray-50 text-gray-800">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Explified Analytics</h1>
            <p className="text-sm text-gray-500">Overview of active users, events, and trends</p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 shadow transition duration-200"
            aria-expanded={drawerOpen}
            aria-controls="explified-drawer"
          >
            Landing page
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card title="Active Users (48h)" value={summary.activeUsers} highlight={true} />
        <Card title="New Users (7d)" value={summary.newUsers} highlight={true} />
        <Card title="Total Events (7d)" value={summary.eventCount} highlight={true} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card title="Sessions (7d)" value={summary.sessions} />
        <Card title="Total Users" value={summary.totalUsers} />
        <Card
          title="Avg. Session"
          value={
            summary.averageSessionDuration
              ? `${Math.floor(summary.averageSessionDuration / 60)}:${String(Math.round(summary.averageSessionDuration % 60)).padStart(2, '0')}`
              : '0:00'
          }
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <ChartCard title="Active Users (Last 7 Days)" data={timeseriesData.length ? timeseriesData : activeUsersData} type="line" dataKey="activeUsers" />
        <ChartCard title="Sessions (Last 7 Days)" data={timeseriesData.length ? timeseriesData : activeUsersData} type="line" dataKey="sessions" />
        <ChartCard title="Total Users (Last 7 Days)" data={timeseriesData.length ? timeseriesData : activeUsersData} type="line" dataKey="totalUsers" />
        <ChartCard
          title="Avg. Session (Last 7 Days)"
          data={timeseriesData.length ? timeseriesData : activeUsersData}
          type="line"
          dataKey="averageSessionDuration"
          formatter={(v) => `${Math.floor(v / 60)}:${String(Math.round(v % 60)).padStart(2, '0')}`}
        />
      </section>

      <section className="bg-white shadow-lg rounded-xl p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Active Users (Raw Data)</h2>
            <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by date (YYYY-MM-DD) or value"
            className="px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="overflow-auto">
          <table className="min-w-full table-auto border-collapse text-gray-800">
            <thead className="sticky top-0 bg-white/80 backdrop-blur">
              <tr className="uppercase text-sm font-semibold tracking-wider text-gray-700">
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Active Users</th>
              </tr>
            </thead>
            <tbody>
              {activeUsersData
                .filter((row) => {
                  if (!filter) return true;
                  const dateStr = `${row.date.slice(0, 4)}-${row.date.slice(4, 6)}-${row.date.slice(6)}`;
                  return dateStr.includes(filter) || row.activeUsers.toString().includes(filter.replace(/,/g, ""));
                })
                .map((row, i) => (
                  <tr
                    key={i}
                    className={`transition-all duration-200 hover:bg-indigo-50 hover:shadow-sm rounded-lg ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    tabIndex={0}
                    role="row"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.currentTarget.classList.toggle("bg-indigo-50");
                      }
                    }}
                  >
                    <td className="px-5 py-3 font-mono text-gray-800">{`${row.date.slice(0, 4)}-${row.date.slice(4, 6)}-${row.date.slice(6)}`}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{row.activeUsers.toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-300"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div className="w-px bg-gray-200 h-full" aria-hidden="true" />
          <aside
            id="explified-drawer"
            className={`relative ml-auto w-[86vw] max-w-full h-full bg-white shadow-2xl transform transition-transform duration-300 ${drawerActive ? 'translate-x-0' : 'translate-x-full'}`}
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 h-full overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Panel</h3>
                <button
                  onClick={closeDrawer}
                  className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:scale-105"
                  aria-label="Close panel"
                >
                  Close
                </button>
              </div>

              <div className="flex gap-6">
                {/* left-side button column (sticky) */}
                <div className="w-40 flex-none self-start sticky top-6 flex flex-col gap-2">
                  {['Landing', 'Browser', 'Demographic', 'Traffic acquisition'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setPanelTab(t)}
                      aria-pressed={panelTab === t}
                      className={`text-sm text-left w-full px-3 py-2 rounded-md transition ${panelTab === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex-1">
                  <div className="prose text-sm text-gray-700">
                          {/* panel content switches by tab */}
                                          {panelTab === 'Landing' ? (
                                            <>
                                              <h4 className="text-lg font-semibold mb-2">Landing Pages</h4>
                                              <div className="text-sm text-gray-500 mb-4">Sessions by landing page over time</div>
                                              {landingChartData && landingChartData.length > 0 && landingChartSeries && landingChartSeries.length > 0 && (
                                                <div className="w-full h-56 mb-4 bg-white rounded-md p-2 shadow-sm">
                                                  <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={landingChartData}>
                                                      <CartesianGrid strokeDasharray="3 3" stroke="#f7f7f7" />
                                                      <XAxis dataKey="date" tick={{ fill: '#374151' }} />
                                                      <YAxis tick={{ fill: '#374151' }} />
                                                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6 }} />
                                                      <Legend />
                                                      {landingChartSeries.map((name, idx) => (
                                                        <Line key={name} type="monotone" dataKey={name} stroke={["#c08400", "#0ea5e9", "#34d399", "#f59e0b", "#ef4444", "#8b5cf6"][idx % 6]} strokeWidth={2} dot={false} />
                                                      ))}
                                                    </LineChart>
                                                  </ResponsiveContainer>
                                                </div>
                                              )}

                                              <div className="overflow-auto">
                                                <table className="w-full table-fixed border-collapse text-gray-800 text-sm">
                                                  <thead className="sticky top-0  backdrop-blur">
                                                    <tr className="uppercase text-xs font-semibold tracking-wider text-gray-700">
                                                      <th className="px-2 py-2 text-left w-6 "><input type="checkbox" aria-label="select all" /></th>
                                                      <th className="px-2 py-2 text-left w-[32%]"><span className="border-b-2 border-dashed border-black">Landing Page</span></th>
                                                      <th className="px-2 py-2 text-right w-20"><span className="border-b-2 border-dashed border-black">Sessions</span></th>
                                                      <th className="px-2 py-2 text-right w-20"><span className="border-b-2 border-dashed border-black">Active Users</span></th>
                                                      <th className="px-2 py-2 text-right w-20"><span className="border-b-2 border-dashed border-black">New Users</span></th>
                                                      <th className="px-2 py-2 text-right w-28"><span className="border-b-2 border-dashed border-black">Avg. Engagement</span></th>
                                                      <th className="px-2 py-2 text-right w-20"><span className="border-b-2 border-dashed border-black">Key Events</span></th>
                                                      <th className="px-2 py-2 text-right w-24"><span className="border-b-2 border-dashed border-black">Session Event Rate</span></th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {landingPagesData.length === 0 ? (
                                                      <tr>
                                                        <td colSpan={8} className="px-2 py-6 text-center text-gray-400">No landing page data available</td>
                                                      </tr>
                                                    ) : (
                                                      landingPagesData.map((row, i) => (
                                                        <tr key={i} className={`transition-all duration-200 hover:bg-indigo-50 hover:shadow-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                          <td className="px-2 py-2"><input type="checkbox" aria-label={`select ${row.landingPage}`} /></td>
                                                          <td className="px-2 py-2 font-mono text-gray-800 truncate max-w-[30ch]">{row.landingPage}</td>
                                                          <td className="px-2 py-2 text-right">
                                                            <div className="font-semibold text-gray-900">{row.sessions.toLocaleString()}</div>
                                                            <div className="text-[11px] text-gray-500">{row.sessionsPct ? `${row.sessionsPct.toFixed(2)}%` : '0% of total'}</div>
                                                          </td>
                                                          <td className="px-2 py-2 text-right">
                                                            <div className="font-semibold text-gray-900">{row.activeUsers.toLocaleString()}</div>
                                                            <div className="text-[11px] text-gray-500">{row.activeUsersPct ? `${row.activeUsersPct.toFixed(2)}%` : '0% of total'}</div>
                                                          </td>
                                                          <td className="px-2 py-2 text-right">
                                                            <div className="font-semibold text-gray-900">{row.newUsers.toLocaleString()}</div>
                                                            <div className="text-[11px] text-gray-500">{row.newUsersPct ? `${row.newUsersPct.toFixed(2)}%` : '0%'}</div>
                                                          </td>
                                                          <td className="px-2 py-2 text-right">{fmtDuration(row.averageSessionDuration)}</td>
                                                          <td className="px-2 py-2 text-right">{row.eventCount.toLocaleString()}</td>
                                                          <td className="px-2 py-2 text-right">{row.sessionEventRate ? `${row.sessionEventRate.toFixed(0)}%` : '0%'}</td>
                                                        </tr>
                                                      ))
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </>
                                          ) : panelTab === 'Browser' ? (
                                            <>
                                              <h4 className="text-lg font-semibold mb-2">Browser</h4>
                                              <div className="text-sm text-gray-500 mb-4">Active users by browser (last 7 days)</div>
                                              {browserChartData && browserChartData.length > 0 && (
                                                <div className="w-full h-56 mb-4 bg-white rounded-md p-2 shadow-sm">
                                                  <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={browserChartData} layout="vertical">
                                                      <CartesianGrid strokeDasharray="3 3" stroke="#f7f7f7" />
                                                      <XAxis type="number" tick={{ fill: '#374151' }} />
                                                      <YAxis type="category" dataKey="browser" width={140} tick={{ fill: '#374151' }} />
                                                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6 }} />
                                                      <Bar dataKey="activeUsers" fill="#c08400" />
                                                    </BarChart>
                                                  </ResponsiveContainer>
                                                </div>
                                              )}

                                              <div className="overflow-auto">
                                                <table className="w-full table-fixed border-collapse text-gray-800 text-sm">
                                                  <thead className="sticky top-0  backdrop-blur">
                                                    <tr className="uppercase text-xs font-semibold tracking-wider text-gray-700">
                                                      <th className="px-2 py-2 text-left w-6 "><input type="checkbox" aria-label="select all" /></th>
                                                      <th className="px-2 py-2 text-left"><span className="border-b-2 border-dashed border-black">Browser</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">Active users</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">New users</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">Engaged sessions</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">Engagement rate</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">Engaged sessions / active user</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">Avg. engagement time</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">Event count</span></th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {browserData.length === 0 ? (
                                                      <tr>
                                                        <td colSpan={9} className="px-2 py-6 text-center text-gray-400">No browser data available</td>
                                                      </tr>
                                                    ) : (
                                                      browserData.map((b, i) => (
                                                        <tr key={i} className={`transition-all duration-200 hover:bg-indigo-50 hover:shadow-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                          <td className="px-2 py-2"><input type="checkbox" aria-label={`select ${b.browser}`} /></td>
                                                          <td className="px-2 py-2 font-mono text-gray-800">{b.browser}</td>
                                                          <td className="px-2 py-2 text-right font-semibold text-gray-900">{b.activeUsers.toLocaleString()} <div className="text-[11px] text-gray-500">{b.activeUsersPct ? `${b.activeUsersPct.toFixed(2)}%` : '0%'}</div></td>
                                                          <td className="px-2 py-2 text-right">{b.newUsers.toLocaleString()}</td>
                                                          <td className="px-2 py-2 text-right">{b.engagedSessions.toLocaleString()}</td>
                                                          <td className="px-2 py-2 text-right">{b.engagedRate ? `${b.engagedRate.toFixed(2)}%` : '0%'}</td>
                                                          <td className="px-2 py-2 text-right">{b.engagedPerActive ? b.engagedPerActive.toFixed(2) : '0'}</td>
                                                          <td className="px-2 py-2 text-right">{fmtDuration(b.averageSessionDuration)}</td>
                                                          <td className="px-2 py-2 text-right">{b.eventCount.toLocaleString()}</td>
                                                        </tr>
                                                      ))
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </>
                                          ) : panelTab === 'Demographic' ? (
                                            <>
                                              <h4 className="text-lg font-semibold mb-2">Demographics - Countries</h4>
                                              <div className="text-sm text-gray-500 mb-4">Active users by country (last 7 days)</div>
                                              {countryChartData && countryChartData.length > 0 && (
                                                <div className="w-full h-56 mb-4 bg-white rounded-md p-2 shadow-sm">
                                                  <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={countryChartData} layout="vertical">
                                                      <CartesianGrid strokeDasharray="3 3" stroke="#f7f7f7" />
                                                      <XAxis type="number" tick={{ fill: '#374151' }} />
                                                      <YAxis type="category" dataKey="country" width={180} tick={{ fill: '#374151' }} />
                                                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6 }} />
                                                      <Bar dataKey="activeUsers" fill="#c08400" />
                                                    </BarChart>
                                                  </ResponsiveContainer>
                                                </div>
                                              )}

                                              <div className="overflow-auto">
                                                <table className="w-full table-fixed border-collapse text-gray-800 text-sm">
                                                  <thead className="sticky top-0  backdrop-blur">
                                                    <tr className="uppercase text-xs font-semibold tracking-wider text-gray-700">
                                                      <th className="px-2 py-2 text-left w-6 "><input type="checkbox" aria-label="select all" /></th>
                                                      <th className="px-2 py-2 text-left w-[30%]"><span className="border-b-2 border-dashed border-black">Country</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">Active users</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">New users</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">Engaged sessions</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">Engagement rate</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">Engaged / active</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">Avg. engagement</span></th>
                                                      <th className="px-2 py-2 text-right"><span className="border-b-2 border-dashed border-black">Event count</span></th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {countryData.length === 0 ? (
                                                      <tr>
                                                        <td colSpan={9} className="px-2 py-6 text-center text-gray-400">No country data available</td>
                                                      </tr>
                                                    ) : (
                                                      countryData.map((c, i) => (
                                                        <tr key={i} className={`transition-all duration-200 hover:bg-indigo-50 hover:shadow-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                          <td className="px-2 py-2"><input type="checkbox" aria-label={`select ${c.country}`} /></td>
                                                          <td className="px-2 py-2 font-mono text-gray-800">{c.country}</td>
                                                          <td className="px-2 py-2 text-right font-semibold text-gray-900">{c.activeUsers.toLocaleString()} <div className="text-[11px] text-gray-500">{c.activeUsersPct ? `${c.activeUsersPct.toFixed(2)}%` : '0%'}</div></td>
                                                          <td className="px-2 py-2 text-right">{c.newUsers.toLocaleString()}</td>
                                                          <td className="px-2 py-2 text-right">{c.engagedSessions.toLocaleString()}</td>
                                                          <td className="px-2 py-2 text-right">{c.engagedRate ? `${c.engagedRate.toFixed(2)}%` : '0%'}</td>
                                                          <td className="px-2 py-2 text-right">{c.engagedPerActive ? c.engagedPerActive.toFixed(2) : '0'}</td>
                                                          <td className="px-2 py-2 text-right">{fmtDuration(c.averageSessionDuration)}</td>
                                                          <td className="px-2 py-2 text-right">{c.eventCount.toLocaleString()}</td>
                                                        </tr>
                                                      ))
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </>
                                          ) : panelTab === 'Traffic acquisition' ? (
                                            <>
                                              <h4 className="text-lg font-semibold mb-2">Traffic acquisition</h4>
                                              <div className="text-sm text-gray-500 mb-4">Top traffic channels and trends</div>
                                              {trafficChartData && trafficChartData.length > 0 && trafficChartSeries && trafficChartSeries.length > 0 && (
                                                <div className="w-full h-56 mb-4 bg-white rounded-md p-2 shadow-sm">
                                                  <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={trafficChartData}>
                                                      <CartesianGrid strokeDasharray="3 3" stroke="#f7f7f7" />
                                                      <XAxis dataKey="date" tick={{ fill: '#374151' }} />
                                                      <YAxis tick={{ fill: '#374151' }} />
                                                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6 }} />
                                                      <Legend />
                                                      {trafficChartSeries.map((name, idx) => (
                                                        <Line key={name} type="monotone" dataKey={name} stroke={["#c08400", "#0ea5e9", "#34d399", "#f59e0b", "#ef4444", "#8b5cf6"][idx % 6]} strokeWidth={2} dot={false} />
                                                      ))}
                                                    </LineChart>
                                                  </ResponsiveContainer>
                                                </div>
                                              )}

                                              <div className="overflow-auto">
                                                <table className="w-full table-fixed border-collapse text-gray-800 text-sm">
                                                  <thead className="sticky top-0  backdrop-blur">
                                                    <tr className="uppercase text-xs font-semibold tracking-wider text-gray-700">
                                                      <th className="px-2 py-2 text-left w-6 "><input type="checkbox" aria-label="select all" /></th>
                                                      <th className="px-2 py-2 text-left w-[32%]"><span className="border-b-2 border-dashed border-black">Channel</span></th>
                                                      <th className="px-2 py-2 text-right w-20"><span className="border-b-2 border-dashed border-black">Sessions</span></th>
                                                      <th className="px-2 py-2 text-right w-20"><span className="border-b-2 border-dashed border-black">Engaged sessions</span></th>
                                                      <th className="px-2 py-2 text-right w-20"><span className="border-b-2 border-dashed border-black">Engagement rate</span></th>
                                                      <th className="px-2 py-2 text-right w-28"><span className="border-b-2 border-dashed border-black">Avg. engagement</span></th>
                                                      <th className="px-2 py-2 text-right w-20"><span className="border-b-2 border-dashed border-black">Events / session</span></th>
                                                      <th className="px-2 py-2 text-right w-24"><span className="border-b-2 border-dashed border-black">Event count</span></th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {trafficData.length === 0 ? (
                                                      <tr>
                                                        <td colSpan={8} className="px-2 py-6 text-center text-gray-400">No traffic data available</td>
                                                      </tr>
                                                    ) : (
                                                      trafficData.map((row, i) => (
                                                        <tr key={i} className={`transition-all duration-200 hover:bg-indigo-50 hover:shadow-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                          <td className="px-2 py-2"><input type="checkbox" aria-label={`select ${row.channel}`} /></td>
                                                          <td className="px-2 py-2 font-mono text-gray-800 truncate max-w-[30ch]">{row.channel}</td>
                                                          <td className="px-2 py-2 text-right"><div className="font-semibold text-gray-900">{row.sessions.toLocaleString()}</div></td>
                                                          <td className="px-2 py-2 text-right">{row.engagedSessions.toLocaleString()}</td>
                                                          <td className="px-2 py-2 text-right">{row.engagementRate ? `${row.engagementRate.toFixed(2)}%` : '0%'}</td>
                                                          <td className="px-2 py-2 text-right">{fmtDuration(row.averageSessionDuration)}</td>
                                                          <td className="px-2 py-2 text-right">{row.eventsPerSession ? row.eventsPerSession.toFixed(2) : '0.00'}</td>
                                                          <td className="px-2 py-2 text-right">{row.eventCount.toLocaleString()}</td>
                                                        </tr>
                                                      ))
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="text-sm text-gray-500">No view selected</div>
                                          )}
                  
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

const Card = ({ title = "", value, highlight = false }) => {
  return (
    <div className={`rounded-lg p-5 transition-all duration-200 ${highlight ? 'bg-white shadow-lg ring-1 ring-indigo-50' : 'bg-white shadow-sm'}`}>
      <div className="flex flex-col">
        <h3 className={`${highlight ? 'text-indigo-700' : 'text-gray-600'} text-sm font-medium mb-2`}>{title}</h3>
        <p className={`text-3xl font-extrabold text-gray-900`}>{value.toLocaleString()}</p>
      </div>
    </div>
  );
};

const ChartCard = ({ title, data = [], dataKey = 'activeUsers', formatter }) => (
  <div className="bg-white shadow-sm rounded-lg p-5 hover:shadow-md transition-all duration-200 border border-gray-100 focus:outline-none">
    <h2 className="text-xl font-semibold mb-4 text-gray-900">{title}</h2>
    <div className="w-full h-80">
      {(!data || data.length === 0) ? (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="h-3 w-48 bg-gray-100 rounded-full mb-3 animate-pulse" />
            <div>No data available</div>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fill: "#374151" }} />
            <YAxis tick={{ fill: "#374151" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#ffffff", borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}
              cursor={{ stroke: "#4f46e5", strokeWidth: 2 }}
              formatter={formatter}
            />
            <Line type="monotone" dataKey={dataKey} stroke="#4f46e5" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);

export default Dashboard;