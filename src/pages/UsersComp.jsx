import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { BarChart3, X } from "lucide-react";

const PRIMARY = "#23B5B5";

/* APPS */
const APPS = [
  "Youtube Summarizer",
  "AI Subtitler",
  "Text To Video Generator",
  "Slideshow Maker",
  "BG Remover",
  "Image Styler",
  "Video Meme Generator",
  "Integrations",
  "Socials",
  "AI GIF Generator",
  "AI Hugging Video",
  "Ageing Video AI",
  "AI Tattoo Generator",
  "Image To Video AI",
  "Link To Video AI",
];

/* helpers */
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const assignRandomSubscriptions = () => {
  const count = randomInt(1, 3);
  return [...APPS].sort(() => 0.5 - Math.random()).slice(0, count);
};

const buildTrend = () =>
  Array.from({ length: 7 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    events: randomInt(40, 180),
  }));

export default function UserComponent() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [showSubFilter, setShowSubFilter] = useState(false);
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
const [activeApp, setActiveApp] = useState(null);
const [activeUser, setActiveUser] = useState(null);


  const dropdownRef = useRef(null);

  /* FETCH USERS */
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get(
        "https://us-central1-explified-app.cloudfunctions.net/api/api/users/users"
      );

      const cleaned = (res.data.users || [])
        .filter(
          (u) =>
            (u.firstName && u.firstName.trim()) ||
            (u.lastName && u.lastName.trim())
        )
        .map((u) => ({
          ...u,
          _subscriptions: assignRandomSubscriptions(),
          _usage: randomInt(120, 450),
        }));

      setUsers(cleaned);
      setFilteredUsers(cleaned);
    };

    fetchUsers();
  }, []);

  /* OUTSIDE CLICK */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSubFilter(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* FILTER */
  useEffect(() => {
    let data = [...users];

    if (search) {
      data = data.filter((u) =>
        `${u.firstName || ""} ${u.lastName || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (selectedSubs.length > 0) {
      data = data.filter((u) =>
        u._subscriptions.some((s) => selectedSubs.includes(s))
      );
    }

    setFilteredUsers(data);
  }, [users, search, selectedSubs]);

  /* ANALYTICS DATA */
  const analyticsData = useMemo(() => {
    return selectedSubs.map((app) => {
      const appUsers = users.filter((u) =>
        u._subscriptions.includes(app)
      );
      const totalEvents = appUsers.reduce(
        (sum, u) => sum + u._usage,
        0
      );

      return {
        app,
        users: appUsers.length,
        events: totalEvents,
        avg: appUsers.length
          ? Math.round(totalEvents / appUsers.length)
          : 0,
        trend: buildTrend(),
      };
    });
  }, [selectedSubs, users]);

  return (
    <section className="text-slate-100">
      <div className="bg-[#020617] border border-slate-800 shadow-xl">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <h2 className="text-lg font-semibold">Explified Users</h2>
          <p className="text-sm text-slate-400 mt-1">
            All users who have logged in to Explified products.
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-teal-500/10 text-teal-300 border border-teal-500/40">
              {users.length} users
            </span>

            {/* SUB FILTER */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowSubFilter((v) => !v)}
                className="px-3 py-1.5 rounded-md text-xs border border-slate-700 hover:border-teal-400"
              >
                Subscription ▾
              </button>

              {showSubFilter && (
                <div className="absolute left-0 mt-3 w-[520px] bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl z-30">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {APPS.map((app) => {
                      const active = selectedSubs.includes(app);
                      return (
                        <label
                          key={app}
                          className={`flex gap-3 p-2 rounded-xl cursor-pointer border
                            ${
                              active
                                ? "border-teal-400/40 bg-teal-500/10 text-teal-300"
                                : "border-slate-800 hover:border-slate-700"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() =>
                              setSelectedSubs((prev) =>
                                active
                                  ? prev.filter((s) => s !== app)
                                  : [...prev, app]
                              )
                            }
                            className="accent-teal-500 mt-1"
                          />
                          {app}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* VIEW ANALYTICS */}
            <button
              disabled={selectedSubs.length === 0}
              onClick={() => setShowAnalytics(true)}
              className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-md text-xs border
                ${
                  selectedSubs.length > 0
                    ? "border-teal-400 text-teal-300 hover:bg-teal-500/10"
                    : "border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
            >
              <BarChart3 size={14} />
              View Analytics
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="px-6 py-3 border-b border-slate-800">
          <input
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE (UNCHANGED STRUCTURE) */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Subscription</th>
                <th className="px-6 py-3">Usage</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const name = `${u.firstName} ${u.lastName}`.trim();
                const initials = name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2);

                return (
                  <tr
                    key={u.id}
                    className="border-t border-slate-800 hover:bg-teal-500/5"
                  >
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                          style={{ backgroundColor: PRIMARY }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="font-medium">{name}</div>
                          <div className="text-[11px] text-slate-400">
                            Explified user
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u._subscriptions.map((s) => (
                          <span
                            key={s}
                            onClick={() => setSelectedSubs([s])}
                            className="cursor-pointer px-2 py-0.5 rounded-full text-[11px] bg-teal-500/10 text-teal-300 border border-teal-500/40"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      ~{u._usage} events
                    </td>
                    <td className="px-6 py-4 text-right">
                <button
  onClick={() => setActiveUser(u)}
  className="px-3 py-1.5 rounded-full border border-slate-600 text-xs hover:border-teal-400 hover:text-teal-300 transition"
>
  View profile
</button>

                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ANALYTICS MODAL */}
{/* ANALYTICS DRAWER */}
{/* ANALYTICS DRAWER */}
<AnimatePresence>
  {showAnalytics && (
    <motion.div
      className="fixed inset-0 z-40 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/50"
        onClick={() => {
          setShowAnalytics(false);
          setActiveApp(null);
        }}
      />

      {/* Drawer */}
      <motion.div
        className="w-[560px] h-full bg-slate-950 border-l border-slate-800 p-6 overflow-y-auto"
        initial={{ x: 560 }}
        animate={{ x: 0 }}
        exit={{ x: 560 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              App Analytics
            </h3>
            <p className="text-xs text-slate-400">
              Analytics for selected subscriptions
            </p>
          </div>
          <button
            onClick={() => {
              setShowAnalytics(false);
              setActiveApp(null);
            }}
            className="p-1 rounded hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* APP SUMMARY + DRILLDOWN */}
        <div className="space-y-4">
          {analyticsData.map((app) => {
            const isActive = activeApp?.app === app.app;

            return (
              <div
                key={app.app}
                className={`rounded-2xl border transition-all
                  ${
                    isActive
                      ? "border-teal-400/40 bg-teal-500/5"
                      : "border-slate-800 bg-slate-900/60 hover:bg-slate-900"
                  }`}
              >
                {/* App Header */}
                <button
                  onClick={() =>
                    setActiveApp(isActive ? null : app)
                  }
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-200">
                        {app.app}
                      </div>
                      <div className="text-xs text-slate-400">
                        {app.users} users · {app.events} events
                      </div>
                    </div>
                    <div className="text-xs text-teal-300">
                      {isActive ? "Hide details" : "View details"}
                    </div>
                  </div>

                  {/* Mini KPIs */}
                  <div className="mt-4 grid grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400">Bounce</div>
                      <div className="text-slate-200 font-medium">
                        {randomInt(20, 60)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Avg session</div>
                      <div className="text-slate-200 font-medium">
                        {randomInt(2, 6)}m
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Engagement</div>
                      <div className="text-slate-200 font-medium">
                        {randomInt(60, 95)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Events</div>
                      <div className="text-slate-200 font-medium">
                        {app.events}
                      </div>
                    </div>
                  </div>
                </button>

                {/* DRILLDOWN SECTION */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-4 pb-4"
                    >
                      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                        <div className="text-xs text-slate-400 mb-2">
                          Usage trend (demo)
                        </div>

                        <div className="h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={app.trend}>
                              <XAxis dataKey="day" hide />
                              <YAxis />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="events"
                                stroke={PRIMARY}
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="mt-3 text-xs text-slate-400">
                          Insight: Users engaging with{" "}
                          <span className="text-slate-200 font-medium">
                            {app.app}
                          </span>{" "}
                          show consistent activity with moderate retention.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
{/* USER PROFILE DRAWER */}
{/* USER PROFILE DRAWER (POLISHED) */}
<AnimatePresence>
  {activeUser && (
    <motion.div
      className="fixed inset-0 z-40 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/50"
        onClick={() => setActiveUser(null)}
      />

      {/* Drawer */}
      <motion.div
        className="w-[440px] h-full bg-gradient-to-b from-slate-950 to-slate-900
          border-l border-slate-800 p-6 overflow-y-auto"
        initial={{ x: 440 }}
        animate={{ x: 0 }}
        exit={{ x: 440 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              User Profile
            </h3>
            <p className="text-xs text-slate-400">
              Account overview & usage
            </p>
          </div>
          <button
            onClick={() => setActiveUser(null)}
            className="p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* USER CARD */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center
              text-sm font-semibold text-white shadow-md"
            style={{ backgroundColor: PRIMARY }}
          >
            {`${activeUser.firstName?.[0] || ""}${activeUser.lastName?.[0] || ""}`}
          </div>

          <div>
            <div className="text-sm font-medium text-slate-200">
              {activeUser.firstName} {activeUser.lastName}
            </div>
            <div className="text-xs text-slate-400">
              {activeUser.email}
            </div>
            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5
              rounded-full text-[11px]
              bg-teal-500/10 text-teal-300 border border-teal-500/40">
              Explified user
            </div>
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-300 mb-3">
            Basic Information
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4
            space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Name</span>
              <span className="text-slate-200">
                {activeUser.firstName} {activeUser.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email</span>
              <span className="text-slate-200">
                {activeUser.email}
              </span>
            </div>
            {activeUser.id && (
              <div className="flex justify-between">
                <span className="text-slate-400">User ID</span>
                <span className="text-slate-200">
                  {activeUser.id}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SUBSCRIPTIONS */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-300 mb-3">
            Subscriptions
          </div>

          <div className="flex flex-wrap gap-2">
            {activeUser._subscriptions.map((s) => (
              <span
                key={s}
                className="px-3 py-1 rounded-full text-[11px] font-medium
                  bg-teal-500/10 text-teal-300
                  border border-teal-500/40"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* USAGE METRICS */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-300 mb-3">
            Usage Metrics
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-xs text-slate-400">
                Total events
              </div>
              <div className="text-lg font-semibold text-slate-200 mt-1">
                {activeUser._usage}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-xs text-slate-400">
                Avg per app
              </div>
              <div className="text-lg font-semibold text-slate-200 mt-1">
                {Math.round(
                  activeUser._usage / activeUser._subscriptions.length
                )}
              </div>
            </div>
          </div>
        </div>

        {/* INSIGHT */}
        <div className="rounded-xl border border-slate-800 bg-gradient-to-br
          from-slate-900 to-slate-900/60 p-4 text-xs text-slate-400">
          Insight: This user shows steady engagement across multiple Explified
          tools, indicating consistent product adoption.
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


    </section>
  );
}
