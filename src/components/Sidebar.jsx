import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const Sidebar = () => {
  const [users, setUsers] = useState([]);

  // Load users from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("users");
    if (stored) setUsers(JSON.parse(stored));
  }, []);

  // Save users to localStorage when updated
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);



  return (
    <div className="w-64 h-[calc(100vh-64px)] bg-white border-r border-gray-200 pt-6 px-6 fixed top-16 left-0 z-10 overflow-y-auto">
      <nav className="space-y-3">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `block font-medium px-2 py-1 rounded hover:bg-gray-100 transition ${
              isActive ? "text-blue-600 bg-gray-100" : "text-gray-700"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/product-analytics"
          className={({ isActive }) =>
            `block font-medium px-2 py-1 rounded hover:bg-gray-100 transition ${
              isActive ? "text-blue-600 bg-gray-100" : "text-gray-700"
            }`
          }
        >
          Product Analytics
        </NavLink>
        {/* <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `block font-medium px-2 py-1 rounded hover:bg-gray-100 transition ${
              isActive ? "text-blue-600 bg-gray-100" : "text-gray-700"
            }`
          }
        >
          Analytics
        </NavLink>
        <NavLink
          to="/analytics/yt"
          className={({ isActive }) =>
            `block font-medium px-2 py-1 rounded hover:bg-gray-100 transition ${
              isActive ? "text-blue-600 bg-gray-100" : "text-gray-700"
            }`
          }
        >
          Youtube Analytics
        </NavLink>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block font-medium px-2 py-1 rounded hover:bg-gray-100 transition ${
              isActive ? "text-blue-600 bg-gray-100" : "text-gray-700"
            }`
          }
        >
          Extensions analytics
        </NavLink>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block font-medium px-2 py-1 rounded hover:bg-gray-100 transition ${
              isActive ? "text-blue-600 bg-gray-100" : "text-gray-700"
            }`
          }
        >
          Explified Analytics
        </NavLink> */}

        {/* Users Dropdown */}
     <NavLink
          to="explified/users"
          className={({ isActive }) =>
            `block font-medium px-2 py-1 rounded hover:bg-gray-100 transition ${
              isActive ? "text-blue-600 bg-gray-100" : "text-gray-700"
            }`
          }
        >
          User Data
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
