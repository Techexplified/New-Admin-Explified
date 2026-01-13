// Sidebar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  Users,
  Bell,
  Settings,
  LogOut,
  UserIcon,
  X,
  Menu,
  GitGraphIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { persistor } from "../redux/store";

const PRIMARY = "#23B5B5";
const PRIMARY_DARK = "#1B8F8F";
const DARK_BG = "#050816";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { to: "/product-analytics", label: "Product Analytics", Icon: BarChart2 },
    { to: "/explified/users", label: "User Data", Icon: Users },
    { to: "/explified/tracker", label: "V Tracker", Icon: GitGraphIcon },
  ];

  const profileEmail = user?.email || "admin@explified.com";

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profileEmail
  )}&background=23B5B5&color=fff`;

  const handleLogout = () => {
    dispatch(logout());
    persistor.purge();
    navigate("/");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-slate-900/80 text-white"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 md:hidden transition ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          border-r border-slate-800
          transition-all duration-300
          ${isOpen ? "w-64" : "w-20"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ backgroundColor: DARK_BG }}
      >
        <div className="flex flex-col h-full px-3 py-4 text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                }}
              >
                E
              </div>
              {isOpen && (
                <span className="text-sm font-semibold">
                  Explified Admin
                </span>
              )}
            </div>

            {/* Collapse button */}
            <button
              onClick={() => setIsOpen((p) => !p)}
              className="hidden md:flex p-1 text-slate-400 hover:text-white"
            >
              {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            {/* Mobile close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  transition
                  ${
                    isActive
                      ? "bg-slate-900 text-teal-200 border-l-2"
                      : "text-slate-300 hover:bg-slate-900"
                  }
                `
                }
                style={{ borderColor: PRIMARY }}
              >
                <Icon size={18} style={{ color: PRIMARY }} />
                {isOpen && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Account */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <img src={avatarUrl} className="w-8 h-8 rounded-full" />
              {isOpen && (
                <span className="text-xs text-slate-300 truncate">
                  {profileEmail}
                </span>
              )}
            </div>

            <SidebarBtn Icon={UserIcon} label="Profile" isOpen={isOpen} />
            <SidebarBtn Icon={Bell} label="Notifications" isOpen={isOpen} />
            <SidebarBtn Icon={Settings} label="Settings" isOpen={isOpen} />

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-3 py-2.5 w-full text-sm text-red-400 hover:bg-red-900/40 rounded-lg"
            >
              <LogOut size={16} />
              {isOpen && "Sign out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer */}
      <div className={`hidden md:block ${isOpen ? "w-64" : "w-20"}`} />
    </>
  );
}

function SidebarBtn({ Icon, label, isOpen }) {
  return (
    <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg bg-slate-900/40 hover:bg-slate-900/70">
      <Icon size={16} style={{ color: PRIMARY }} />
      {isOpen && <span className="text-sm">{label}</span>}
    </button>
  );
}
