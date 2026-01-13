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
import {
  Activity,
  UserPlus,
  MousePointerClick,
  Users as UsersIcon,
  Clock3,
} from "lucide-react";

const GA4_PROPERTY_ID = "489164789";
const TEAL = "#23B5B5";
const TEAL_DARK = "#1B8F8F";

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
  const [panelTab, setPanelTab] = useState("Landing");

  const [browserData, setBrowserData] = useState([]);
  const [browserChartData, setBrowserChartData] = useState([]);

  const [countryData, setCountryData] = useState([]);
  const [countryChartData, setCountryChartData] = useState([]);

  const [trafficData, setTrafficData] = useState([]);
  const [trafficChartData, setTrafficChartData] = useState([]);
  const [trafficChartSeries, setTrafficChartSeries] = useState([]);

  // --- GA4 FETCH LOGIC ---
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }

    const initGapiAndFetch = async () => {
      try {
        await gapi.load("client:auth2", async () => {
          await gapi.client.init({
            discoveryDocs: [
              "https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta",
            ],
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

        // MAIN TIMESERIES
        const multiResp =
          await gapi.client.analyticsdata.properties.runReport({
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
            averageSessionDuration: parseFloat(
              row.metricValues[3].value || 0
            ),
          })) || [];

        const sorted = chartData
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date));
        setActiveUsersData(sorted);
        setTimeseriesData(sorted);

        // SUMMARY METRICS
        const summaryResp =
          await gapi.client.analyticsdata.properties.runReport({
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

        // LANDING PAGES
        try {
          const landingResp =
            await gapi.client.analyticsdata.properties.runReport({
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
            averageSessionDuration: parseFloat(
              r.metricValues?.[3]?.value || 0
            ),
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
            {
              sessions: 0,
              activeUsers: 0,
              newUsers: 0,
              eventCount: 0,
              revenue: 0,
            }
          );

          const withPct = parsed.map((p) => ({
            ...p,
            sessionsPct: totals.sessions
              ? (p.sessions / totals.sessions) * 100
              : 0,
            activeUsersPct: totals.activeUsers
              ? (p.activeUsers / totals.activeUsers) * 100
              : 0,
            newUsersPct: totals.newUsers
              ? (p.newUsers / totals.newUsers) * 100
              : 0,
            sessionEventRate: p.sessions
              ? (p.eventCount / p.sessions) * 100
              : 0,
          }));

          const TOP_PAGES_COUNT = 25;
          setLandingPagesData(withPct.slice(0, TOP_PAGES_COUNT));

          // LANDING TIMESERIES
          try {
            const TOP_CHART_PAGES = 6;
            const topPagesAll = parsed
              .slice()
              .sort((a, b) => b.sessions - a.sessions)
              .slice(0, TOP_PAGES_COUNT)
              .map((p) => p.landingPage);
            const topChartPages = topPagesAll.slice(0, TOP_CHART_PAGES);
            setLandingChartSeries(topChartPages);

            const timesResp =
              await gapi.client.analyticsdata.properties.runReport({
                property: `properties/${GA4_PROPERTY_ID}`,
                dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
                dimensions: [{ name: "date" }, { name: "landingPage" }],
                metrics: [{ name: "sessions" }],
                limit: 100000,
              });

            const tRows = timesResp.result.rows || [];
            const map = {};
            tRows.forEach((r) => {
              const dateKey = r.dimensionValues?.[0]?.value;
              const lp = r.dimensionValues?.[1]?.value || "(not set)";
              const sessions = parseInt(r.metricValues?.[0]?.value || 0);
              if (!topChartPages.includes(lp)) return;
              map[dateKey] = map[dateKey] || {};
              map[dateKey][lp] = sessions;
            });

            const days = 30;
            const dates = [];
            for (let i = days; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              const key = `${y}${m}${day}`;
              const label = `${y}-${m}-${day}`;
              dates.push({ key, label });
            }

            const chartData = dates.map(({ key, label }) => {
              const obj = { date: label };
              topChartPages.forEach((name) => {
                obj[name] =
                  map[key] && typeof map[key][name] !== "undefined"
                    ? map[key][name]
                    : 0;
              });
              return obj;
            });

            setLandingChartData(chartData);
          } catch (e) {
            console.warn("Failed to fetch landing timeseries:", e);
            setLandingChartData([]);
            setLandingChartSeries([]);
          }

          // BROWSER
          try {
            const browserResp =
              await gapi.client.analyticsdata.properties.runReport({
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

              browser: r.dimensionValues?.[0]?.value || "(not set)",
              activeUsers: parseInt(r.metricValues?.[0]?.value || 0),
              newUsers: parseInt(r.metricValues?.[1]?.value || 0),
              engagedSessions: parseInt(r.metricValues?.[2]?.value || 0),
              sessions: parseInt(r.metricValues?.[3]?.value || 0),
              averageSessionDuration: parseFloat(
                r.metricValues?.[4]?.value || 0
              ),
              eventCount: parseInt(r.metricValues?.[5]?.value || 0),
            }));

            const totalsB = browsers.reduce(
              (acc, cur) => {
                acc.activeUsers += cur.activeUsers;
                acc.newUsers += cur.newUsers;
                acc.engagedSessions += cur.engagedSessions;
                acc.sessions += cur.sessions;
                acc.eventCount += cur.eventCount;
                return acc;
              },
              {
                activeUsers: 0,
                newUsers: 0,
                engagedSessions: 0,
                sessions: 0,
                eventCount: 0,
              }
            );

            const withDerived = browsers.map((b) => ({
              ...b,
              activeUsersPct: totalsB.activeUsers
                ? (b.activeUsers / totalsB.activeUsers) * 100
                : 0,
              engagedRate: b.sessions
                ? (b.engagedSessions / b.sessions) * 100
                : 0,
              engagedPerActive: b.activeUsers
                ? b.engagedSessions / b.activeUsers
                : 0,
            }));

            setBrowserData(withDerived);
            setBrowserChartData(
              withDerived
                .slice()
                .sort((a, b) => b.activeUsers - a.activeUsers)
            );
          } catch (be) {
            console.warn("Failed to fetch browser data:", be);
            setBrowserData([]);
            setBrowserChartData([]);
          }

          // COUNTRY
          try {
            const countryResp =
              await gapi.client.analyticsdata.properties.runReport({
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
              country: r.dimensionValues?.[0]?.value || "(not set)",
              activeUsers: parseInt(r.metricValues?.[0]?.value || 0),
              newUsers: parseInt(r.metricValues?.[1]?.value || 0),
              engagedSessions: parseInt(r.metricValues?.[2]?.value || 0),
              sessions: parseInt(r.metricValues?.[3]?.value || 0),
              averageSessionDuration: parseFloat(
                r.metricValues?.[4]?.value || 0
              ),
              eventCount: parseInt(r.metricValues?.[5]?.value || 0),
            }));

            const totalsC = countries.reduce(
              (acc, cur) => {
                acc.activeUsers += cur.activeUsers;
                acc.newUsers += cur.newUsers;
                acc.engagedSessions += cur.engagedSessions;
                acc.sessions += cur.sessions;
                acc.eventCount += cur.eventCount;
                return acc;
              },
              {
                activeUsers: 0,
                newUsers: 0,
                engagedSessions: 0,
                sessions: 0,
                eventCount: 0,
              }
            );

            const withDerivedC = countries.map((c) => ({
              ...c,
              activeUsersPct: totalsC.activeUsers
                ? (c.activeUsers / totalsC.activeUsers) * 100
                : 0,
              engagedRate: c.sessions
                ? (c.engagedSessions / c.sessions) * 100
                : 0,
              engagedPerActive: c.activeUsers
                ? c.engagedSessions / c.activeUsers
                : 0,
            }));

            setCountryData(withDerivedC);
            setCountryChartData(
              withDerivedC
                .slice()
                .sort((a, b) => b.activeUsers - a.activeUsers)
            );
          } catch (ce) {
            console.warn("Failed to fetch country data:", ce);
            setCountryData([]);
            setCountryChartData([]);
          }

          // TRAFFIC
          try {
            const trafficResp =
              await gapi.client.analyticsdata.properties.runReport({
                property: `properties/${GA4_PROPERTY_ID}`,
                dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
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
              channel: r.dimensionValues?.[0]?.value || "(not set)",
              sessions: parseInt(r.metricValues?.[0]?.value || 0),
              engagedSessions: parseInt(r.metricValues?.[1]?.value || 0),
              eventCount: parseInt(r.metricValues?.[2]?.value || 0),
              averageSessionDuration: parseFloat(
                r.metricValues?.[3]?.value || 0
              ),
            }));

            const requiredChannels = ["Organic Social", "Unassigned"];
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

            const trafficWithDerived = trafficParsed.map((t) => ({
              ...t,
              engagementRate: t.sessions
                ? (t.engagedSessions / t.sessions) * 100
                : 0,
              eventsPerSession: t.sessions ? t.eventCount / t.sessions : 0,
            }));

            const TOP_TRAFFIC_COUNT = 25;
            setTrafficData(trafficWithDerived.slice(0, TOP_TRAFFIC_COUNT));

            const TOP_CHART = 6;
            const topChannelsAll = trafficWithDerived
              .slice()
              .sort((a, b) => b.sessions - a.sessions)
              .slice(0, TOP_TRAFFIC_COUNT)
              .map((p) => p.channel);
            const topChartChannels = topChannelsAll.slice(0, TOP_CHART);
            setTrafficChartSeries(topChartChannels);

            const timesResp2 =
              await gapi.client.analyticsdata.properties.runReport({
                property: `properties/${GA4_PROPERTY_ID}`,
                dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
                dimensions: [
                  { name: "date" },
                  { name: "sessionDefaultChannelGroup" },
                ],
                metrics: [{ name: "sessions" }],
                limit: 100000,
              });

            const t2Rows = timesResp2.result.rows || [];
            const map2 = {};
            t2Rows.forEach((r) => {
              const dateKey = r.dimensionValues?.[0]?.value;
              const ch =
                r.dimensionValues?.[1]?.value || "(not set)";
              const sessions = parseInt(r.metricValues?.[0]?.value || 0);
              if (!topChartChannels.includes(ch)) return;
              map2[dateKey] = map2[dateKey] || {};
              map2[dateKey][ch] = sessions;
            });

            const days2 = 30;
            const dates2 = [];
            for (let i = days2; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              const key = `${y}${m}${day}`;
              const label = `${y}-${m}-${day}`;
              dates2.push({ key, label });
            }

            const trafficChart = dates2.map(({ key, label }) => {
              const obj = { date: label };
              topChartChannels.forEach((name) => {
                obj[name] =
                  map2[key] && typeof map2[key][name] !== "undefined"
                    ? map2[key][name]
                    : 0;
              });
              return obj;
            });

            setTrafficChartData(trafficChart);
          } catch (te) {
            console.warn("Failed to fetch traffic acquisition data:", te);
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

  // drawer animation
  useEffect(() => {
    let t;
    if (drawerOpen) {
      t = setTimeout(() => setDrawerActive(true), 20);
    } else {
      setDrawerActive(false);
    }
    return () => clearTimeout(t);
  }, [drawerOpen]);

  // ESC to close panel
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

  // --- UI LAYER (dark theme) ---

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#050816] text-xl font-semibold text-slate-100">
        Loading data...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#050816] text-red-400 text-center p-6 space-y-4">
        <p>❌ {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-full shadow bg-slate-900 text-slate-100 hover:bg-slate-800 transition-all duration-200 hover:scale-105 border border-slate-700"
        >
          Reload
        </button>
      </div>
    );

  const seriesData = timeseriesData.length ? timeseriesData : activeUsersData;

  return (
    <div className="min-h-screen bg-[#050816] px-4 sm:px-6 lg:px-8 py-6 text-slate-100">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* MAIN ANALYTICS SECTION */}
        <section className="bg-[#020617] rounded-3xl shadow-[0_18px_40px_rgba(0,0,0,0.65)] border border-slate-800 px-4 sm:px-6 lg:px-8 py-6 lg:py-7">
          {/* HEADER */}
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 mb-2 border border-slate-700">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: TEAL }}
                />
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  Product analytics
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
                Explified Analytics
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Snapshot of users, sessions and engagement over the last 7 days.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-400 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Last 7 days</span>
              </div>

              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-200 hover:translate-y-[1px]"
                style={{
                  background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                }}
                aria-expanded={drawerOpen}
                aria-controls="explified-drawer"
              >
                Landing & segments
              </button>
            </div>
          </header>

          {/* TOP METRICS STRIP */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
            <MetricCard
              title="Active users"
              subtitle="Last 7 days"
              value={summary.activeUsers}
              variant="primary"
              icon="pulse"
            />
            <MetricCard
              title="New users"
              subtitle="Last 7 days"
              value={summary.newUsers}
              icon="userPlus"
            />
            <MetricCard
              title="Total events"
              subtitle="Last 7 days"
              value={summary.eventCount}
              icon="click"
            />
          </section>

          {/* SECONDARY METRICS */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-7">
            <MetricCard
              title="Sessions"
              subtitle="Last 7 days"
              value={summary.sessions}
              compact
              icon="activity"
            />
            <MetricCard
              title="Total users"
              subtitle="All time"
              value={summary.totalUsers}
              compact
              icon="users"
            />
            <MetricCard
              title="Avg. session length"
              subtitle="Last 7 days"
              value={
                summary.averageSessionDuration
                  ? `${Math.floor(
                      summary.averageSessionDuration / 60
                    )}:${String(
                      Math.round(
                        summary.averageSessionDuration % 60
                      )
                    ).padStart(2, "0")}`
                  : "0:00"
              }
              compact
              icon="clock"
            />
          </section>

          {/* CHART GRID */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ChartCard
              title="Active users (last 7 days)"
              data={seriesData}
              dataKey="activeUsers"
            />
            <ChartCard
              title="Sessions (last 7 days)"
              data={seriesData}
              dataKey="sessions"
            />
            <ChartCard
              title="Total users (last 7 days)"
              data={seriesData}
              dataKey="totalUsers"
            />
            <ChartCard
              title="Avg. session duration"
              data={seriesData}
              dataKey="averageSessionDuration"
              formatter={(v) =>
                `${Math.floor(v / 60)}:${String(
                  Math.round(v % 60)
                ).padStart(2, "0")}`
              }
            />
          </section>
        </section>

        {/* RAW DATA TABLE */}
        <section className="bg-[#020617] rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.65)] border border-slate-800 px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-50">
                Active users by day
              </h2>
              <p className="text-xs text-slate-400">
                Raw daily counts for the current time range.
              </p>
            </div>
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by date or value"
              className="px-3 py-2 border border-slate-700 bg-slate-900 rounded-full shadow-sm text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 focus:outline-none transition-all duration-200"
            />
          </div>

          <div className="overflow-auto rounded-2xl border border-slate-800">
            <table className="min-w-full table-auto text-xs sm:text-sm text-slate-100">
              <thead className="bg-slate-900/95 backdrop-blur sticky top-0 z-10">
                <tr className="uppercase text-[11px] font-semibold tracking-wide text-slate-400">
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Active users</th>
                </tr>
              </thead>
              <tbody>
                {activeUsersData
                  .filter((row) => {
                    if (!filter) return true;
                    const dateStr = `${row.date.slice(
                      0,
                      4
                    )}-${row.date.slice(4, 6)}-${row.date.slice(6)}`;
                    return (
                      dateStr.includes(filter) ||
                      row.activeUsers
                        .toString()
                        .includes(filter.replace(/,/g, ""))
                    );
                  })
                  .map((row, i) => (
                    <tr
                      key={i}
                      className={`transition-colors duration-120 hover:bg-teal-500/10 ${
                        i % 2 === 0 ? "bg-slate-900" : "bg-slate-800/80"
                      }`}
                    >
                      <td className="px-5 py-3 font-mono text-slate-100">
                        {`${row.date.slice(0, 4)}-${row.date.slice(
                          4,
                          6
                        )}-${row.date.slice(6)}`}
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-50">
                        {row.activeUsers.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* SIDE PANEL */}
      {drawerOpen && (
        <SidePanel
          drawerActive={drawerActive}
          closeDrawer={closeDrawer}
          panelTab={panelTab}
          setPanelTab={setPanelTab}
          landingChartData={landingChartData}
          landingChartSeries={landingChartSeries}
          landingPagesData={landingPagesData}
          browserChartData={browserChartData}
          browserData={browserData}
          countryChartData={countryChartData}
          countryData={countryData}
          trafficChartData={trafficChartData}
          trafficChartSeries={trafficChartSeries}
          trafficData={trafficData}
          fmtDuration={fmtDuration}
        />
      )}
    </div>
  );
};

/* ---------- PRESENTATION COMPONENTS ---------- */

const MetricCard = ({
  title,
  subtitle,
  value,
  variant = "default",
  compact = false,
  icon,
}) => {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;

  const isPrimary = variant === "primary";

  const iconMap = {
    pulse: <Activity className="w-4 h-4" />,
    userPlus: <UserPlus className="w-4 h-4" />,
    click: <MousePointerClick className="w-4 h-4" />,
    users: <UsersIcon className="w-4 h-4" />,
    activity: <Activity className="w-4 h-4" />,
    clock: <Clock3 className="w-4 h-4" />,
  };

  return (
    <div
      className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-4 border transition-all duration-150 ${
        isPrimary
          ? "bg-teal-500/10 border-teal-500/40 shadow-sm"
          : "bg-slate-900 border-slate-800 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {title}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`flex items-center justify-center rounded-full ${
              compact ? "w-7 h-7" : "w-8 h-8"
            }`}
            style={{
              background: isPrimary
                ? "rgba(35,181,181,0.18)"
                : "rgba(15,23,42,0.7)",
              color: isPrimary ? TEAL : "#e5f9f9",
            }}
          >
            {iconMap[icon]}
          </div>
        )}
      </div>
      <p
        className={`mt-2 ${
          compact ? "text-xl" : "text-2xl"
        } sm:text-2xl font-semibold text-slate-50`}
      >
        {formattedValue}
      </p>
    </div>
  );
};

const ChartCard = ({ title, data = [], dataKey = "activeUsers", formatter }) => (
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
            <XAxis
              dataKey="date"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 11 }}
            />
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

/* ---------- SIDE PANEL + TABS ---------- */
/* ---------- SIDE PANEL (HEIGHT FIXED + PROFESSIONAL) ---------- */

const SidePanel = ({
  drawerActive,
  closeDrawer,
  panelTab,
  setPanelTab,
  landingChartData,
  landingChartSeries,
  landingPagesData,
  browserChartData,
  browserData,
  countryChartData,
  countryData,
  trafficChartData,
  trafficChartSeries,
  trafficData,
  fmtDuration,
}) => {
  const tabs = [
    "Landing",
    "Browser",
    "Demographic",
    "Traffic acquisition",
  ];

  return (
    <div
      className={`fixed inset-0 z-50 ${
        drawerActive ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          drawerActive ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`
          absolute right-0 bottom-0
          md:top-6 md:bottom-6 md:right-6
          w-full md:w-[78vw] lg:w-[68vw] xl:w-[58vw]
          
          /* HEIGHT CONTROL */
          h-[88svh] md:h-[calc(100vh-3rem)]
          
          bg-[#020617]
          border-t md:border border-slate-800
          shadow-[0_0_40px_rgba(0,0,0,0.6)]
          rounded-t-2xl md:rounded-xl
          
          transform transition-transform duration-300
          ease-[cubic-bezier(.22,.61,.36,1)]
          ${drawerActive
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-x-full"}
        `}
      >
        {/* ===== HEADER (FIXED HEIGHT) ===== */}
        <div className="sticky top-0 z-10 bg-[#020617]/95 backdrop-blur border-b border-slate-800">
          {/* Drag handle (mobile only) */}
          <div className="md:hidden flex justify-center py-2">
            <span className="h-1.5 w-10 rounded-full bg-slate-700" />
          </div>

          <div className="px-4 sm:px-6 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-50">
                  Deep dive analytics
                </h3>
                <p className="text-[11px] text-slate-400">
                  Granular performance breakdowns
                </p>
              </div>
              <button
                onClick={closeDrawer}
                className="h-9 px-4 rounded-full bg-slate-900 text-[11px] font-medium text-slate-200 hover:bg-slate-800 border border-slate-700 transition"
              >
                Close
              </button>
            </div>

            {/* MOBILE TABS */}
            <div className="mt-4 flex md:hidden gap-2 overflow-x-auto scrollbar-hide">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setPanelTab(t)}
                  className={`flex-shrink-0 px-4 h-9 text-xs rounded-full transition ${
                    panelTab === t
                      ? "bg-teal-600 text-white"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== BODY (NO EXTRA SCROLL) ===== */}
        <div className="flex h-[calc(100%-128px)] md:h-[calc(100%-80px)] overflow-hidden">
          {/* DESKTOP TABS */}
          <aside className="hidden md:flex w-44 flex-col gap-2 p-4 border-r border-slate-800">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setPanelTab(t)}
                className={`text-sm text-left px-3 py-2.5 rounded-lg transition ${
                  panelTab === t
                    ? "bg-teal-600 text-white"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </aside>

          {/* CONTENT */}
          <section className="flex-1 min-w-0 px-4 sm:px-6 py-4 overflow-y-auto text-sm text-slate-100">
            {panelTab === "Landing" && (
              <LandingTab
                landingChartData={landingChartData}
                landingChartSeries={landingChartSeries}
                landingPagesData={landingPagesData}
                fmtDuration={fmtDuration}
              />
            )}

            {panelTab === "Browser" && (
              <BrowserTab
                browserChartData={browserChartData}
                browserData={browserData}
                fmtDuration={fmtDuration}
              />
            )}

            {panelTab === "Demographic" && (
              <DemographicTab
                countryChartData={countryChartData}
                countryData={countryData}
                fmtDuration={fmtDuration}
              />
            )}

            {panelTab === "Traffic acquisition" && (
              <TrafficTab
                trafficChartData={trafficChartData}
                trafficChartSeries={trafficChartSeries}
                trafficData={trafficData}
                fmtDuration={fmtDuration}
              />
            )}
          </section>
        </div>
      </aside>
    </div>
  );
};


/* --- INDIVIDUAL TABS (dark) --- */

const LandingTab = ({
  landingChartData,
  landingChartSeries,
  landingPagesData,
  fmtDuration,
}) => (
  <>
    <h4 className="text-lg font-semibold mb-1 text-slate-50">
      Landing pages
    </h4>
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
                  stroke={[
                    "#22c55e",
                    "#0ea5e9",
                    "#f97316",
                    "#6366f1",
                    "#e11d48",
                    "#14b8a6",
                  ][idx % 6]}
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
              <td
                colSpan={8}
                className="px-2 py-6 text-center text-slate-500"
              >
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
                    {row.newUsersPct
                      ? `${row.newUsersPct.toFixed(2)}%`
                      : "0%"}
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

const BrowserTab = ({ browserChartData, browserData, fmtDuration }) => (
  <>
    <h4 className="text-lg font-semibold mb-1 text-slate-50">Browser</h4>
    <div className="text-xs text-slate-400 mb-4">
      Active users by browser (last 7 days).
    </div>

    {browserChartData && browserChartData.length > 0 && (
      <div className="w-full h-56 mb-4 bg-slate-900 rounded-md p-2 shadow-sm border border-slate-800">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={browserChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" tick={{ fill: "#e5e7eb" }} />
            <YAxis
              type="category"
              dataKey="browser"
              width={140}
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
            <th className="px-2 py-2 text-left">Browser</th>
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
          {browserData.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="px-2 py-6 text-center text-slate-500"
              >
                No browser data available.
              </td>
            </tr>
          ) : (
            browserData.map((b, i) => (
              <tr
                key={i}
                className={`transition-all duration-150 hover:bg-teal-500/10 ${
                  i % 2 === 0 ? "bg-slate-900" : "bg-slate-800/80"
                }`}
              >
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    aria-label={`select ${b.browser}`}
                  />
                </td>
                <td className="px-2 py-2 font-mono text-slate-100">
                  {b.browser}
                </td>
                <td className="px-2 py-2 text-right font-semibold text-slate-50">
                  {b.activeUsers.toLocaleString()}
                  <div className="text-[11px] text-slate-400">
                    {b.activeUsersPct
                      ? `${b.activeUsersPct.toFixed(2)}%`
                      : "0%"}
                  </div>
                </td>
                <td className="px-2 py-2 text-right">
                  {b.newUsers.toLocaleString()}
                </td>
                <td className="px-2 py-2 text-right">
                  {b.engagedSessions.toLocaleString()}
                </td>
                <td className="px-2 py-2 text-right">
                  {b.engagedRate ? `${b.engagedRate.toFixed(2)}%` : "0%"}
                </td>
                <td className="px-2 py-2 text-right">
                  {b.engagedPerActive ? b.engagedPerActive.toFixed(2) : "0"}
                </td>
                <td className="px-2 py-2 text-right">
                  {fmtDuration(b.averageSessionDuration)}
                </td>
                <td className="px-2 py-2 text-right">
                  {b.eventCount.toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </>
);

const DemographicTab = ({
  countryChartData,
  countryData,
  fmtDuration,
}) => (
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
              <td
                colSpan={9}
                className="px-2 py-6 text-center text-slate-500"
              >
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
                  <input
                    type="checkbox"
                    aria-label={`select ${c.country}`}
                  />
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

const TrafficTab = ({
  trafficChartData,
  trafficChartSeries,
  trafficData,
  fmtDuration,
}) => (
  <>
    <h4 className="text-lg font-semibold mb-1 text-slate-50">
      Traffic acquisition
    </h4>
    <div className="text-xs text-slate-400 mb-4">
      Top channels and session trends.
    </div>

    {trafficChartData &&
      trafficChartData.length > 0 &&
      trafficChartSeries &&
      trafficChartSeries.length > 0 && (
        <div className="w-full h-56 mb-4 bg-slate-900 rounded-md p-2 shadow-sm border border-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficChartData}>
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
              {trafficChartSeries.map((name, idx) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={[
                    "#22c55e",
                    "#0ea5e9",
                    "#f97316",
                    "#6366f1",
                    "#e11d48",
                    "#14b8a6",
                  ][idx % 6]}
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
            <th className="px-2 py-2 text-left w-[32%]">Channel</th>
            <th className="px-2 py-2 text-right">Sessions</th>
            <th className="px-2 py-2 text-right">Engaged sessions</th>
            <th className="px-2 py-2 text-right">Engagement rate</th>
            <th className="px-2 py-2 text-right">Avg. engagement</th>
            <th className="px-2 py-2 text-right">Events / session</th>
            <th className="px-2 py-2 text-right">Event count</th>
          </tr>
        </thead>
        <tbody>
          {trafficData.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-2 py-6 text-center text-slate-500"
              >
                No traffic data available.
              </td>
            </tr>
          ) : (
            trafficData.map((row, i) => (
              <tr
                key={i}
                className={`transition-all duration-150 hover:bg-teal-500/10 ${
                  i % 2 === 0 ? "bg-slate-900" : "bg-slate-800/80"
                }`}
              >
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    aria-label={`select ${row.channel}`}
                  />
                </td>
                <td className="px-2 py-2 font-mono text-slate-100 truncate max-w-[30ch]">
                  {row.channel}
                </td>
                <td className="px-2 py-2 text-right">
                  <div className="font-semibold text-slate-50">
                    {row.sessions.toLocaleString()}
                  </div>
                </td>
                <td className="px-2 py-2 text-right">
                  {row.engagedSessions.toLocaleString()}
                </td>
                <td className="px-2 py-2 text-right">
                  {row.engagementRate
                    ? `${row.engagementRate.toFixed(2)}%`
                    : "0%"}
                </td>
                <td className="px-2 py-2 text-right">
                  {fmtDuration(row.averageSessionDuration)}
                </td>
                <td className="px-2 py-2 text-right">
                  {row.eventsPerSession
                    ? row.eventsPerSession.toFixed(2)
                    : "0.00"}
                </td>
                <td className="px-2 py-2 text-right">
                  {row.eventCount.toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </>
);

export default Dashboard;
