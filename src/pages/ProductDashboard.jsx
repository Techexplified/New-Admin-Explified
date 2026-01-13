// src/components/ProductDashboard.jsx
import { useState, useEffect, useRef } from "react";
import { Search, TrendingUp, Users, BarChart3, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { gapi } from "gapi-script";
import ShopifyAnalyticsDashboard from "./shopifyDashboard";

const TEAL = "#23B5B5";
const TEAL_DARK = "#1B8F8F";

const suitesMeta = {
  explified: {
    label: "Explified",
    badgeClass:
      "bg-teal-500/10 text-teal-300 border border-teal-500/30",
    description: "Explified suite – core SaaS tools & analytics.",
  },
  extensions: {
    label: "Extensions",
    badgeClass:
      "bg-amber-500/10 text-amber-300 border border-amber-500/30",
    description: "Browser extensions and utilities.",
  },
  shopify: {
    label: "Shopify",
    badgeClass:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
    description: "Shopify apps – revenue & merchant analytics.",
  },
  atlassian: {
    label: "Atlassian",
    badgeClass:
      "bg-sky-500/10 text-sky-300 border border-sky-500/30",
    description: "Jira / Confluence integrations.",
  },
  all: {
    label: "All suites",
    badgeClass:
      "bg-slate-500/10 text-slate-300 border border-slate-500/30",
    description: "Show all tools across suites.",
  },
};

// 🔹 Non-Shopify products stay static
const STATIC_PRODUCTS = [
  // Explified suite
  {
    id: 1,
    name: "Explified Analytics",
    category: "Analytics",
    suite: "explified",
    users: 0,
    traffic: 0,
 
    link: "/explified-analytics/login",
  },
  {
    id: 2,
    name: "Expli",
    category: "Chat Tool",
    suite: "explified",
    users: 3,
    traffic: 3,

    link: "/expli",
  },
  {
    id: 3,
    name: "Notes",
    category: "Tool",
    suite: "explified",
    users: 0,
    traffic: 0,

    link: "/notes",
  },
  {
    id: 4,
    name: "Video Meme Generator AI",
    category: "AI Tool",
    suite: "explified",
    users: 0,
    traffic: 0,

    link: "/video-meme-generator",
  },
  {
    id: 5,
    name: "AI GIF generator",
    category: "AI Tool",
    suite: "explified",
    users: 3,
    traffic: 3,

    link: "/ai-gif-generator",
  },
  {
    id: 6,
    name: "Slideshow Maker AI",
    category: "AI Tool",
    suite: "explified",
    users: 0,
    traffic: 0,

    link: "/slideshow-maker",
  },
  {
    id: 8,
    name: "AI image styler",
    category: "AI Tool",
    suite: "explified",
    users: 0,
    traffic: 0,

    link: "/ai-image-styler",
  },

  // Extensions suite
  {
    id: 7,
    name: "Youtube Summariser",
    category: "Extension",
    suite: "extensions",
    users:0,
    traffic: 0,
   
    link: "/youtube-summariser",
  },
  {
    id: 9,
    name: "Vidsum",
    category: "Extension",
    suite: "extensions",
    users: 0,
    traffic: 0,
  
    link: "/vidsum",
  },
  {
    id: 10,
    name: "Quick Shot",
    category: "Extension",
    suite: "extensions",
    users: 0,
    traffic: 0,

    link: "/quick-shot",
  },

  // Atlassian suite
  {
    id: 14,
    name: "Jira Sprint Reporter",
    category: "Atlassian App",
    suite: "atlassian",
    users: 0,
    traffic: 0,

    link: "/atlassian/jira-sprint-reporter",
  },
  {
    id: 15,
    name: "Confluence AI Docs",
    category: "Atlassian App",
    suite: "atlassian",
    users: 0,
    traffic: 0,
 
    link: "/atlassian/confluence-ai-docs",
  },
];

const ProductDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("7days");
  const [selectedCategory] = useState("all");
  const [selectedSuite, setSelectedSuite] = useState("explified");
  const navigate = useNavigate();

  // drawer state – generic product drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const drawerRef = useRef(null);

  // drawer state – Shopify drawer (per app)
  const [shopifyDrawerOpen, setShopifyDrawerOpen] = useState(false);
  const [selectedShopifyApp, setSelectedShopifyApp] = useState(null);

  // Shopify apps from backend
  const [shopifyApps, setShopifyApps] = useState([]);
  const [shopifyAppsLoading, setShopifyAppsLoading] = useState(false);
  const [shopifyAppsError, setShopifyAppsError] = useState(null);

  const openDrawer = (product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (drawerOpen) closeDrawer();
        if (shopifyDrawerOpen) {
          setShopifyDrawerOpen(false);
          setSelectedShopifyApp(null);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    if (drawerOpen || shopifyDrawerOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, shopifyDrawerOpen]);

  // 🔹 Fetch all Shopify apps (published/submitted) from backend
  useEffect(() => {
    let mounted = true;
    async function loadApps() {
      setShopifyAppsLoading(true);
      setShopifyAppsError(null);
      try {
        // Adjust base URL if needed in prod (e.g. Cloud Function URL)
        const res = await fetch("https://api-pf6diz22ka-uc.a.run.app/api/shopify/partner/apps");
        const text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {}
        if (!res.ok) {
          throw new Error(
            json?.error || text || `Request failed: ${res.status}`
          );
        }
        if (!json || !Array.isArray(json.apps)) {
          throw new Error("Invalid apps payload");
        }
        if (!mounted) return;
        setShopifyApps(json.apps);
      } catch (e) {
        if (mounted) setShopifyAppsError(e.message || "Failed to load apps");
      } finally {
        if (mounted) setShopifyAppsLoading(false);
      }
    }
    loadApps();
    return () => {
      mounted = false;
    };
  }, []);

  const timeFilters = [
    { id: "1day", label: "Last 24 Hours" },
    { id: "7days", label: "Last 7 Days" },
    { id: "28days", label: "Last 28 Days" },
    { id: "90days", label: "Last 90 Days" },
  ];

  // GA4 stuff for non-Shopify products
  const fmtDuration = (secs) => {
    if (!secs || secs <= 0) return "0s";
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return `${m}m ${s}s`;
  };

  const GA4_PROPERTY_ID = "489164789";

  const [liveMetrics, setLiveMetrics] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  const { isAuthenticated, token } = useSelector((s) => s.auth || {});

  // fetch live landing page metrics when a non-Shopify product is selected
  useEffect(() => {
    if (!selectedProduct || selectedProduct.isShopifyApp) return;

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
        await gapi.client.init({
          discoveryDocs: [
            "https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta",
          ],
          token,
        });
        gapi.client.setToken({ access_token: token });

        const resp =
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
            ],
            limit: 1000,
          });

        const rows = resp.result.rows || [];
        const target = selectedProduct.link;
        const found = rows.find(
          (r) => (r.dimensionValues?.[0]?.value || "") === target
        );

        if (!found) {
          if (mounted) {
            setLiveError("Page Not Found");
            setLiveLoading(false);
          }
          return;
        }

        const metrics = found.metricValues || [];
        const sessions = parseInt(metrics[0]?.value || 0, 10);
        const activeUsers = parseInt(metrics[1]?.value || 0, 10);
        const newUsers = parseInt(metrics[2]?.value || 0, 10);
        const avgEng = parseFloat(metrics[3]?.value || 0);
        const eventCount = parseInt(metrics[4]?.value || 0, 10);

        const lm = {
          sessions,
          activeUsers,
          newUsers,
          avgEngagement: Math.round(avgEng),
          keyEvents: eventCount,
          sessionEventRate: sessions
            ? Math.round((eventCount / sessions) * 100)
            : 0,
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

  const generateSparkline = (product) => {
    const base = Math.max(3, Math.round(product.users / 5000));
    const noise = Math.max(1, Math.round(product.traffic / 20000));
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const val = Math.max(
        1,
        base * (1 + Math.sin(i + base) * 0.25) + (i % 2 ? noise : -noise)
      );
      arr.push(Math.round(val * 100));
    }
    return arr;
  };

  const sparklinePoints = (values, width = 120, height = 28) => {
    if (!values || values.length === 0) return "";
    const max = Math.max(...values);
    const min = Math.min(...values);
    const len = values.length;
    return values
      .map((v, i) => {
        const x = (i / (len - 1)) * width;
        const y =
          height -
          ((v - min) / (max - min || 1)) * height;
        return `${x},${y}`;
      })
      .join(" ");
  };

  // mock page-specific metrics for non-Shopify products
  const pageMetrics = {
    "/expli": {
      users: 8921,
      traffic: 32456,
      growth: "+8%",
      trend: [120, 140, 130, 150, 160, 155, 170],
      sessions: 24,
      activeUsers: 8,
      newUsers: 1,
      avgEngagement: 8 * 60 + 53,
      keyEvents: 288,
      sessionEventRate: 1200,
    },
    "/notes": {
      users: 15234,
      traffic: 56789,
      growth: "+15%",
      trend: [220, 210, 230, 240, 260, 255, 270],
      sessions: 5,
      activeUsers: 3,
      newUsers: 0,
      avgEngagement: 20 * 60 + 6,
      keyEvents: 137,
      sessionEventRate: 2740,
    },
    "/video-meme-generator": {
      users: 6789,
      traffic: 23456,
      growth: "+5%",
      trend: [80, 85, 82, 90, 95, 92, 100],
      sessions: 10,
      activeUsers: 6,
      newUsers: 0,
      avgEngagement: 1,
      keyEvents: 21,
      sessionEventRate: 210,
    },
    "/ai-gif-generator": {
      users: 11234,
      traffic: 41234,
      growth: "+10%",
      trend: [150, 155, 160, 158, 165, 170, 175],
      sessions: 11,
      activeUsers: 7,
      newUsers: 1,
      avgEngagement: 39,
      keyEvents: 31,
      sessionEventRate: 3100,
    },
    "/slideshow-maker": {
      users: 9876,
      traffic: 38765,
      growth: "+7%",
      trend: [130, 128, 135, 140, 145, 142, 150],
      sessions: 3,
      activeUsers: 1,
      newUsers: 0,
      avgEngagement: 27 * 60 + 23,
      keyEvents: 141,
      sessionEventRate: 4700,
    },
    "/youtube-summariser": {
      users: 7543,
      traffic: 28901,
      growth: "+6%",
      trend: [95, 100, 98, 110, 115, 112, 120],
      sessions: 7,
      activeUsers: 5,
      newUsers: 2,
      avgEngagement: 1 * 60 + 31,
      keyEvents: 59,
      sessionEventRate: 843,
    },
    "/ai-image-styler": {
      users: 13456,
      traffic: 51234,
      growth: "+13%",
      trend: [160, 165, 170, 175, 180, 178, 185],
      sessions: 13,
      activeUsers: 6,
      newUsers: 1,
      avgEngagement: 10 * 60 + 41,
      keyEvents: 17,
      sessionEventRate: 850,
    },
    "/vidsum": {
      users: 12543,
      traffic: 45678,
      growth: "+12%",
      trend: [140, 145, 150, 148, 155, 160, 165],
      sessions: 2,
      activeUsers: 1,
      newUsers: 0,
      avgEngagement: 5,
      keyEvents: 8,
      sessionEventRate: 400,
    },
    "/quick-shot": {
      users: 6543,
      traffic: 20345,
      growth: "+4%",
      trend: [70, 72, 74, 73, 75, 77, 78],
      sessions: 1,
      activeUsers: 1,
      newUsers: 1,
      avgEngagement: 39,
      keyEvents: 31,
      sessionEventRate: 3100,
    },
  };

  // 🔹 Map backend Shopify apps to product rows
  const shopifyProducts = shopifyApps.map((app, idx) => ({
    id: 1000 + idx,
    name: app.name,
    category: "Shopify App",
    suite: "shopify",
    users: 0, // you can change to app.merchantsCount or similar later
    traffic: 0, // you can change if backend returns metrics
    growth: "+0%",
    link: `/shopify/${app.key}`,
    isShopifyApp: true,
    analyticsKey: app.analyticsKey || app.key,
    status: app.status || "PUBLISHED",
  }));

  const products = [...STATIC_PRODUCTS, ...shopifyProducts];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;
    const matchesSuite =
      selectedSuite === "all" || product.suite === selectedSuite;
    return matchesSearch && matchesCategory && matchesSuite;
  });

  const handleProductClick = (product) => {
    // 👉 If Shopify app, open Shopify analytics drawer (AnnounceMate, PageCraft, etc.)
    if (product.isShopifyApp) {
      setSelectedShopifyApp(product);
      setShopifyDrawerOpen(true);
      return;
    }
    // Non-Shopify -> generic product drawer + GA analytics
    setSelectedShopifyApp(null);
    openDrawer(product);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="flex">
        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <header className="border-b border-slate-800 bg-[#050816]/95 backdrop-blur sticky top-0 z-10">
            <div className="px-2 py-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: TEAL }}
                >
                  Product Dashboard
                </h1>
                <div className="mt-3 max-w-2xl flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-500/40"
                    />
                  </div>

                  {/* Suite dropdown */}
                  <div className="flex items-center gap-2 sm:w-52">
                    <span className="hidden sm:inline text-xs text-slate-400">
                      Suite
                    </span>
                    <select
                      value={selectedSuite}
                      onChange={(e) =>
                        setSelectedSuite(e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-500/40 cursor-pointer"
                    >
                      <option value="explified">
                        Explified
                      </option>
                      <option value="extensions">
                        Extensions
                      </option>
                      <option value="shopify">Shopify</option>
                      <option value="atlassian">
                        Atlassian
                      </option>
                      <option value="all">All suites</option>
                    </select>
                  </div>
                </div>

                {/* Suite hint */}
                <p className="mt-2 text-xs text-slate-400">
                  {suitesMeta[selectedSuite]?.label} suite –{" "}
                  {suitesMeta[selectedSuite]?.description}
                </p>

                {shopifyAppsLoading && selectedSuite === "shopify" && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Loading Shopify apps…
                  </p>
                )}
                {shopifyAppsError && selectedSuite === "shopify" && (
                  <p className="mt-1 text-[11px] text-red-400">
                    Shopify apps error: {shopifyAppsError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter
                    className="w-4 h-4"
                    style={{ color: TEAL }}
                  />
                  <select
                    value={selectedFilter}
                    onChange={(e) =>
                      setSelectedFilter(e.target.value)
                    }
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-500/40 cursor-pointer"
                  >
                    {timeFilters.map((filter) => (
                      <option
                        key={filter.id}
                        value={filter.id}
                      >
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-50 border border-slate-700">
                  GO
                </div>
              </div>
            </div>
          </header>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
              {filteredProducts.length} Products Found
            </h2>

            {/* Header Row */}
            <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                <BarChart3
                  className="w-4 h-4"
                  style={{ color: TEAL }}
                />
                Product
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                <Users
                  className="w-4 h-4"
                  style={{ color: TEAL_DARK }}
                />
                Users
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                <TrendingUp
                  className="w-4 h-4"
                  style={{ color: TEAL_DARK }}
                />
                Traffic
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                <TrendingUp
                  className="w-4 h-4"
                  style={{ color: TEAL_DARK }}
                />
                Category
              </div>
            </div>

            {/* Product Rows */}
            <div className="space-y-3 mt-3">
              {filteredProducts.map((product) => {
                const highlighted =
                  selectedProduct?.id === product.id ||
                  (selectedShopifyApp?.id === product.id &&
                    shopifyDrawerOpen);
                const suite = suitesMeta[product.suite];

                return (
                  <div
                    onClick={() =>
                      handleProductClick(product)
                    }
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    className={`grid grid-cols-4 gap-4 px-6 py-4 rounded-lg border transition-all cursor-pointer group ${
                      highlighted
                        ? "bg-teal-500/10 border-teal-500 shadow-sm"
                        : "bg-slate-900 border-slate-800 hover:border-teal-500/60 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            highlighted
                              ? "text-teal-200"
                              : "text-slate-100"
                          } transition-colors`}
                        >
                          {product.name}
                        </span>
                        {suite && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full leading-none ${suite.badgeClass}`}
                          >
                            {suite.label}
                          </span>
                        )}
                        {product.isShopifyApp && product.status && (
                          <span className="text-[10px] px-2 py-[2px] rounded-full bg-slate-800 text-slate-200 border border-slate-600">
                            {product.status === "PUBLISHED"
                              ? "Published"
                              : product.status === "SUBMITTED"
                              ? "Submitted"
                              : product.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">
                        {product.users.toLocaleString()}
                      </span>
                   
                    </div>

                    <div className="flex items-center">
                      <span className="text-slate-300">
                        {product.traffic.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-slate-300">
                        {product.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">
                  No products found matching your search.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Drawer + overlay for generic (non-Shopify) product metrics */}
        <div aria-hidden={!drawerOpen}>
          {/* overlay */}
          <div
            onClick={closeDrawer}
            className={`fixed inset-0 transition-opacity duration-300 ${
              drawerOpen
                ? "opacity-100 pointer-events-auto backdrop-blur-sm bg-black/60 z-40"
                : "opacity-0 pointer-events-none"
            }`}
          />

          {/* drawer panel */}
          <aside
            ref={drawerRef}
            className={`fixed right-0 top-0 h-full w-full md:w-1/2 lg:w-1/2 bg-[#050816] shadow-2xl border-l border-slate-800 transform transition-transform duration-300 ease-in-out z-50 ${
              drawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">
                    {selectedProduct?.name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {selectedProduct?.category}
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={closeDrawer}
                    className="text-slate-400 hover:text-slate-200 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="mt-6 flex-1 overflow-auto pr-1">
                {selectedProduct && !selectedProduct.isShopifyApp ? (
                  <div className="space-y-4">
                    {(() => {
                      const metrics =
                        liveMetrics ??
                        pageMetrics[selectedProduct.link] ??
                        selectedProduct;
                      return (
                        <div key={selectedProduct.id}>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-sm">
                              <div className="text-xs text-slate-400">
                                Users
                              </div>
                              <div className="text-xl font-semibold text-slate-100">
                                {(
                                  metrics.users ??
                                  selectedProduct.users
                                ).toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-sm">
                              <div className="text-xs text-slate-400">
                                Traffic
                              </div>
                              <div className="text-xl font-semibold text-slate-100">
                                {(
                                  metrics.traffic ??
                                  selectedProduct.traffic
                                ).toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-sm">
                              <div className="text-xs text-slate-400">
                                Growth
                              </div>
                              <div className="text-xl font-semibold text-emerald-400">
                                {metrics.growth ??
                                  selectedProduct.growth}
                              </div>
                            </div>
                          </div>

                          {/* small sparkline */}
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex-1">
                              <div className="text-xs text-slate-400">
                                7-day trend
                              </div>
                              <svg
                                className="w-full h-8 mt-1"
                                viewBox="0 0 120 28"
                                preserveAspectRatio="none"
                              >
                                <polyline
                                  fill="none"
                                  stroke={TEAL}
                                  strokeWidth="2"
                                  points={sparklinePoints(
                                    pageMetrics[
                                      selectedProduct.link
                                    ]?.trend ??
                                      generateSparkline(
                                        selectedProduct
                                      ),
                                    120,
                                    28
                                  )}
                                />
                              </svg>
                            </div>
                            <div className="w-28 text-right">
                              <div className="text-xs text-slate-400">
                                Change
                              </div>
                              <div className="text-lg font-semibold text-slate-100">
                                {metrics.growth ??
                                  selectedProduct.growth}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Detailed metrics */}
                    <div className="mt-6 bg-slate-900 p-4 rounded-lg border border-slate-800">
                      {liveLoading ? (
                        <div className="py-6 text-center text-slate-400">
                          Loading metrics…
                        </div>
                      ) : liveError ? (
                        <div className="py-6 text-center text-red-400">
                          {liveError === "Page Not Found"
                            ? "Page Not Found"
                            : liveError}
                        </div>
                      ) : (
                        (() => {
                          const m =
                            liveMetrics ??
                            pageMetrics[selectedProduct.link] ?? {
                              sessions: 0,
                              activeUsers: 0,
                              newUsers: 0,
                              avgEngagement: 0,
                              keyEvents: 0,
                              sessionEventRate: 0,
                            };
                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div>
                                <div className="text-xs text-slate-400">
                                  Sessions
                                </div>
                                <div className="text-lg font-semibold text-slate-100">
                                  {(m.sessions ?? 0).toLocaleString()}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-slate-400">
                                  Active Users
                                </div>
                                <div className="text-lg font-semibold text-slate-100">
                                  {(
                                    m.activeUsers ?? 0
                                  ).toLocaleString()}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-slate-400">
                                  New Users
                                </div>
                                <div className="text-lg font-semibold text-slate-100">
                                  {(m.newUsers ?? 0).toLocaleString()}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-slate-400">
                                  Avg. Engagement
                                </div>
                                <div className="text-lg font-semibold text-slate-100">
                                  {fmtDuration(
                                    m.avgEngagement ?? 0
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-slate-400">
                                  Key Events
                                </div>
                                <div className="text-lg font-semibold text-slate-100">
                                  {(m.keyEvents ?? 0).toLocaleString()}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-slate-400">
                                  Session Event Rate
                                </div>
                                <div className="text-lg font-semibold text-slate-100">
                                  {m.sessionEventRate
                                    ? `${m.sessionEventRate}%`
                                    : "0%"}
                                </div>
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
                      if (selectedProduct?.link)
                        navigate(selectedProduct.link);
                    }}
                    className="px-4 py-2 rounded-md text-white text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                    style={{
                      background:
                        "linear-gradient(135deg, #23B5B5, #1B8F8F)",
                    }}
                  >
                    Open
                  </button>
                  <button
                    onClick={closeDrawer}
                    className="px-4 py-2 border border-slate-700 rounded-md text-sm text-slate-100 hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 👉 Shopify drawer for any Shopify app (AnnounceMate, PageCraft, etc.) */}
      <ShopifyAnalyticsDashboard
        open={shopifyDrawerOpen}
        onClose={() => {
          setShopifyDrawerOpen(false);
          setSelectedShopifyApp(null);
        }}
        app={selectedShopifyApp}
      />
    </div>
  );
};

export default ProductDashboard;
