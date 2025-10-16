import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const Sidebar = () => {
  const [users, setUsers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newUser, setNewUser] = useState("");

  // Load users from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("users");
    if (stored) setUsers(JSON.parse(stored));
  }, []);

  // Save users to localStorage when updated
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const handleAddUser = () => {
    if (newUser.trim()) {
      setUsers((prev) => [...prev, newUser.trim()]);
      setNewUser("");
    }
  };

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
        <div>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full flex items-center justify-between text-sm font-medium px-3 py-2 rounded-md transition-all
    ${
      dropdownOpen
        ? "bg-blue-50 text-blue-600 shadow-sm"
        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
    }
  `}
          >
            <span className="flex items-center gap-2">Users</span>
            <span className="transition-transform duration-200">
              {dropdownOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>

          {dropdownOpen && (
            <div className="mt-2 ml-2 space-y-2">
              {/* Existing Users */}
              <ul className="text-sm text-gray-700 space-y-1">
                {users.length === 0 && (
                  <li className="text-gray-400 italic">No users yet</li>
                )}
                {users.map((user, index) => (
                  <li
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {user}
                  </li>
                ))}
              </ul>

              {/* Add New User */}
              <div className="pt-2 border-t border-gray-200">
                <input
                  type="text"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  placeholder="New user name"
                  className="w-full px-2 py-1 text-sm border rounded mb-2"
                />
                <button
                  onClick={handleAddUser}
                  className="w-full bg-blue-500 text-white py-1 text-sm rounded hover:bg-blue-600 transition"
                >
                  Add User
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
