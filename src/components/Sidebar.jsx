import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("users");
    if (stored) setUsers(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  return (
    <div className="w-64 h-[calc(100vh-64px)] bg-white border-r border-indigo-100 pt-6 px-6 fixed top-16 left-0 z-10 overflow-y-auto">
      <nav className="space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `block font-medium px-3 py-2 rounded-md transition-all duration-200 hover:bg-indigo-50 hover:scale-[1.01] hover:shadow-sm ${
              isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-700"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/product-analytics"
          className={({ isActive }) =>
            `block font-medium px-3 py-2 rounded-md transition-all duration-200 hover:bg-indigo-50 hover:scale-[1.01] hover:shadow-sm ${
              isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-700"
            }`
          }
        >
          Product Analytics
        </NavLink>
        <NavLink
          to="/explified/users"
          className={({ isActive }) =>
            `block font-medium px-3 py-2 rounded-md transition-all duration-200 hover:bg-indigo-50 hover:scale-[1.01] hover:shadow-sm ${
              isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-700"
            }`
          }
        >
          User Data
        </NavLink>
         <NavLink
          to="/extensions-data"
          className={({ isActive }) =>
            `block font-medium px-3 py-2 rounded-md transition-all duration-200 hover:bg-indigo-50 hover:scale-[1.01] hover:shadow-sm ${
              isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-700"
            }`
          }
        >
          Extension Data
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;