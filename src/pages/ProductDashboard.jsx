import React, { useState, useEffect, useRef } from "react";
import { Search, TrendingUp, Users, BarChart3, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { gapi } from "gapi-script";

const ProductDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("7days");
  const [selectedCategory] = useState("all");
  const navigate = useNavigate();

  // drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const drawerRef = useRef(null);

  const openDrawer = (product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    // delay clearing selectedProduct to allow animation to finish
    setTimeout(() => setSelectedProduct(null), 300);
  };

  // close on ESC and prevent body scroll when drawer open
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    if (drawerOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const timeFilters = [
    { id: "1day", label: "Last 24 Hours" },
    { id: "7days", label: "Last 7 Days" },
    { id: "28days", label: "Last 28 Days" },
    { id: "90days", label: "Last 90 Days" },
  ];

  // updated product list to match the provided mock (10 items)
  const products = [
    { id: 1, name: "Explified Analytics", category: "Youtube Analytics", users: 36300, traffic: 5489, growth: "+13%", link: "/explified-analytics/login" },
    // map these product rows to their respective product pages
    { id: 2, name: "Expli", category: "Chat Tool", users: 8921, traffic: 32456, growth: "+8%", link: "/expli" },
  { id: 3, name: "Notes", category: "Tool", users: 15234, traffic: 56789, growth: "+15%", link: "/notes" },
  { id: 4, name: "Video Meme Generator AI", category: "AI Tool", users: 6789, traffic: 23456, growth: "+5%", link: "/video-meme-generator" },
  { id: 5, name: "AI GIF generator", category: "AI Tool", users: 11234, traffic: 41234, growth: "+10%", link: "/ai-gif-generator" },
  { id: 6, name: "Slideshow Maker AI", category: "AI Tool", users: 9876, traffic: 38765, growth: "+7%", link: "/slideshow-maker" },
    { id: 7, name: "Youtube Summariser", category: "Chrome Extension", users: 7543, traffic: 28901, growth: "+6%", link: "/youtube-summariser" },
    { id: 8, name: "AI image styler", category: "AI Tool", users: 13456, traffic: 51234, growth: "+13%", link: "/ai-image-styler" },
    { id: 9, name: "Vidsum", category: "Chrome Extension", users: 12543, traffic: 45678, growth: "+12%", link: "/vidsum" },
    { id: 10, name: "Quick Shot", category: "Chrome Extension", users: 6543, traffic: 20345, growth: "+4%", link: "/quick-shot" },
  ];

  // mock page-specific metrics keyed by product page path. Replace with real fetches later.
  const pageMetrics = {
    '/expli': { users: 8921, traffic: 32456, growth: '+8%', trend: [120, 140, 130, 150, 160, 155, 170], sessions: 24, activeUsers: 8, newUsers: 1, avgEngagement: 8*60+53, keyEvents: 288, sessionEventRate: 1200 },
    '/notes': { users: 15234, traffic: 56789, growth: '+15%', trend: [220, 210, 230, 240, 260, 255, 270], sessions: 5, activeUsers: 3, newUsers: 0, avgEngagement: 20*60+6, keyEvents: 137, sessionEventRate: 2740 },
    '/video-meme-generator': { users: 6789, traffic: 23456, growth: '+5%', trend: [80, 85, 82, 90, 95, 92, 100], sessions: 10, activeUsers: 6, newUsers: 0, avgEngagement: 1, keyEvents: 21, sessionEventRate: 210 },
    '/ai-gif-generator': { users: 11234, traffic: 41234, growth: '+10%', trend: [150, 155, 160, 158, 165, 170, 175], sessions: 11, activeUsers: 7, newUsers: 1, avgEngagement: 39, keyEvents: 31, sessionEventRate: 3100 },
    '/slideshow-maker': { users: 9876, traffic: 38765, growth: '+7%', trend: [130, 128, 135, 140, 145, 142, 150], sessions: 3, activeUsers: 1, newUsers: 0, avgEngagement: 27*60+23, keyEvents: 141, sessionEventRate: 4700 },
    '/youtube-summariser': { users: 7543, traffic: 28901, growth: '+6%', trend: [95, 100, 98, 110, 115, 112, 120], sessions: 7, activeUsers: 5, newUsers: 2, avgEngagement: 1*60+31, keyEvents: 59, sessionEventRate: 843 },
    '/ai-image-styler': { users: 13456, traffic: 51234, growth: '+13%', trend: [160, 165, 170, 175, 180, 178, 185], sessions: 13, activeUsers: 6, newUsers: 1, avgEngagement: 10*60+41, keyEvents: 17, sessionEventRate: 850 },
    '/vidsum': { users: 12543, traffic: 45678, growth: '+12%', trend: [140, 145, 150, 148, 155, 160, 165], sessions: 2, activeUsers: 1, newUsers: 0, avgEngagement: 5, keyEvents: 8, sessionEventRate: 400 },
    '/quick-shot': { users: 6543, traffic: 20345, growth: '+4%', trend: [70, 72, 74, 73, 75, 77, 78], sessions: 1, activeUsers: 1, newUsers: 1, avgEngagement: 39, keyEvents: 31, sessionEventRate: 3100 },
  };

  const fmtDuration = (secs) => {
    if (!secs || secs <= 0) return '0s';
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return `${m}m ${s}s`;
  };

  // GA4 property id (same as Dashboard)
  const GA4_PROPERTY_ID = "489164789";

  // live metrics state (fetched from GA4 when drawer opens)
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  const { isAuthenticated, token } = useSelector((s) => s.auth || {});

  // fetch live landing page metrics when a product is selected
  useEffect(() => {
    if (!selectedProduct) return;

    let mounted = true;
    const fetchLive = async () => {
      setLiveMetrics(null);
      setLiveError(null);
      setLiveLoading(true);

      try {
        if (!isAuthenticated || !token) {
          setLiveError("Not authenticated");
          setLiveLoading(false);
          return;
        }

        await gapi.load("client:auth2");
        await gapi.client.init({ discoveryDocs: ["https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta"], token });
        gapi.client.setToken({ access_token: token });

        const resp = await gapi.client.analyticsdata.properties.runReport({
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
          ],
          limit: 1000,
        });

        const rows = resp.result.rows || [];
        // try to find exact match for the landing page path
        const target = selectedProduct.link;
        const found = rows.find((r) => (r.dimensionValues?.[0]?.value || "") === target);

        if (!found) {
          // not found in GA4 rows
          if (mounted) {
            setLiveError("Page Not Found");
            setLiveLoading(false);
          }
          return;
        }

        const metrics = found.metricValues || [];
        const sessions = parseInt(metrics[0]?.value || 0);
        const activeUsers = parseInt(metrics[1]?.value || 0);
        const newUsers = parseInt(metrics[2]?.value || 0);
        const avgEng = parseFloat(metrics[3]?.value || 0);
        const eventCount = parseInt(metrics[4]?.value || 0);

        const lm = {
          sessions,
          activeUsers,
          newUsers,
          avgEngagement: Math.round(avgEng),
          keyEvents: eventCount,
          sessionEventRate: sessions ? Math.round((eventCount / sessions) * 100) : 0,
        };

        if (mounted) {
          setLiveMetrics(lm);
          setLiveLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setLiveError(err.message || String(err));
          setLiveLoading(false);
        }
      }
    };

    fetchLive();

    return () => {
      mounted = false;
    };
  }, [selectedProduct, isAuthenticated, token]);

  // helper: generate small sparkline data (7 points) from product numbers
  const generateSparkline = (product) => {
    // create a deterministic set derived from users and traffic
    const base = Math.max(3, Math.round(product.users / 5000));
    const noise = Math.max(1, Math.round(product.traffic / 20000));
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const val = Math.max(1, base * (1 + Math.sin(i + base) * 0.25) + (i % 2 ? noise : -noise));
      arr.push(Math.round(val * 100));
    }
    return arr;
  };

  const sparklinePoints = (values, width = 120, height = 28) => {
    if (!values || values.length === 0) return '';
    const max = Math.max(...values);
    const min = Math.min(...values);
    const len = values.length;
    return values.map((v, i) => {
      const x = (i / (len - 1)) * width;
      const y = height - ((v - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    }).join(' ');
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Inner layout: left small nav + content to mimic the mock */}
      <div className="flex">
  
   

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="px-2 py-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-indigo-600">Product Dashboard</h1>
                <div className="mt-3 max-w-2xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-300" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-500" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="bg-white border border-indigo-100 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-50 cursor-pointer"
                  >
                    {timeFilters.map((filter) => (
                      <option key={filter.id} value={filter.id}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">GO</div>
              </div>
            </div>
          </header>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{filteredProducts.length} Products Found</h2>

            {/* Header Row */}
            <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Product
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                <Users className="w-4 h-4 text-indigo-500" />
                Users
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Traffic
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Category
              </div>
            </div>

            {/* Product Rows */}
            <div className="space-y-3 mt-3">
              {filteredProducts.map((product) => {
                // highlight only when the drawer is open for this product
                const highlighted = selectedProduct?.id === product.id;
                return (
                  <div
                    onClick={() => openDrawer(product)}
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    className={`grid grid-cols-4 gap-4 px-6 py-4 bg-white rounded-lg border transition-all cursor-pointer group ${highlighted ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex flex-col">
                      <span className={`font-medium ${highlighted ? 'text-indigo-600' : 'text-gray-800'} transition-colors`}>{product.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{product.users.toLocaleString()}</span>
                      <span className="text-xs text-emerald-500 font-medium">{product.growth}</span>
                    </div>

                    <div className="flex items-center">
                      <span className="text-gray-600">{product.traffic.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 capitalize">{product.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching your search.</p>
              </div>
            )}
          </div>
        </main>

        {/* Drawer + overlay */}
        <div aria-hidden={!drawerOpen}>
          {/* overlay */}
          <div
            onClick={closeDrawer}
            className={`fixed inset-0 transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto backdrop-blur-sm bg-black/10 z-40' : 'opacity-0 pointer-events-none'}`}
          />

          {/* drawer panel */}
          <aside
            ref={drawerRef}
            className={`fixed right-0 top-0 h-full w-full md:w-1/2 lg:w-1/2 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedProduct?.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedProduct?.category}</p>
                </div>
                <div className="ml-4">
                  <button onClick={closeDrawer} className="text-gray-500 hover:text-gray-700">Close</button>
                </div>
              </div>

              <div className="mt-6 flex-1 overflow-auto">
                {selectedProduct ? (
                  <div className="space-y-4">
                    {/* prefer liveMetrics when available */}
                    {(() => {
                      const metrics = liveMetrics ?? pageMetrics[selectedProduct.link] ?? selectedProduct;
                      return (
                        <div key={selectedProduct.id}>
                          {/* Metric cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-3 rounded-lg border shadow-sm">
                              <div className="text-xs text-gray-500">Users</div>
                              <div className="text-xl font-semibold text-gray-900">{(metrics.users ?? selectedProduct.users).toLocaleString()}</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border shadow-sm">
                              <div className="text-xs text-gray-500">Traffic</div>
                              <div className="text-xl font-semibold text-gray-900">{(metrics.traffic ?? selectedProduct.traffic).toLocaleString()}</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border shadow-sm">
                              <div className="text-xs text-gray-500">Growth</div>
                              <div className="text-xl font-semibold text-emerald-500">{(metrics.growth ?? selectedProduct.growth)}</div>
                            </div>
                          </div>

                          {/* small sparkline */}
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex-1">
                              <div className="text-xs text-gray-500">7-day trend</div>
                              <svg className="w-full h-8 mt-1" viewBox="0 0 120 28" preserveAspectRatio="none">
                                <polyline
                                  fill="none"
                                  stroke="#4f46e5"
                                  strokeWidth="2"
                                  points={sparklinePoints(pageMetrics[selectedProduct.link]?.trend ?? generateSparkline(selectedProduct), 120, 28)}
                                />
                              </svg>
                            </div>
                            <div className="w-28 text-right">
                              <div className="text-xs text-gray-500">Change</div>
                              <div className="text-lg font-semibold text-gray-900">{(metrics.growth ?? selectedProduct.growth)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    {/* productMetrics: prefer page-specific metrics when available */}
                    {/* use pageMetrics[selectedProduct.link] if present, otherwise fall back to selectedProduct */}
                    {/* Metric cards */}
                  

             

                    <div className="pt-4">
                      <p className="text-gray-700">Quick description and actions for the product can go here. Add metrics, links or settings.</p>
                    </div>

                    {/* Landing-style detailed metrics (live if available) */}
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
                      {liveLoading ? (
                        <div className="py-6 text-center text-gray-500">Loading metrics…</div>
                      ) : liveError ? (
                        <div className="py-6 text-center text-red-500">{liveError === 'Page Not Found' ? 'Page Not Found' : liveError}</div>
                      ) : (
                        (() => {
                          const m = liveMetrics ?? pageMetrics[selectedProduct.link] ?? { sessions: 0, activeUsers: 0, newUsers: 0, avgEngagement: 0, keyEvents: 0, sessionEventRate: 0 };
                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div>
                                <div className="text-xs text-gray-500">Sessions</div>
                                <div className="text-lg font-semibold text-gray-900">{(m.sessions ?? 0).toLocaleString()}</div>
                                <div className="text-[11px] text-gray-400">{m.sessions ? `${((m.sessions / Math.max(1, m.sessions)) * 100).toFixed(2)}%` : ''}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-500">Active Users</div>
                                <div className="text-lg font-semibold text-gray-900">{(m.activeUsers ?? 0).toLocaleString()}</div>
                                <div className="text-[11px] text-gray-400">{m.sessions ? `${((m.activeUsers / Math.max(1, m.sessions)) * 100).toFixed(2)}%` : ''}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-500">New Users</div>
                                <div className="text-lg font-semibold text-gray-900">{(m.newUsers ?? 0).toLocaleString()}</div>
                                <div className="text-[11px] text-gray-400">{m.sessions ? `${((m.newUsers / Math.max(1, m.sessions)) * 100).toFixed(2)}%` : ''}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-500">Avg. Engagement</div>
                                <div className="text-lg font-semibold text-gray-900">{fmtDuration(m.avgEngagement ?? 0)}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-500">Key Events</div>
                                <div className="text-lg font-semibold text-gray-900">{(m.keyEvents ?? 0).toLocaleString()}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-500">Session Event Rate</div>
                                <div className="text-lg font-semibold text-gray-900">{m.sessionEventRate ? `${m.sessionEventRate}%` : '0%'}</div>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (selectedProduct?.link) navigate(selectedProduct.link);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Open
                  </button>
                  <button onClick={closeDrawer} className="px-4 py-2 border rounded-md">Close</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;