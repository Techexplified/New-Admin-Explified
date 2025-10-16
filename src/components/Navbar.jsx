import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { persistor } from "../redux/store";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut } from "lucide-react";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  const handleLogout = () => {
    dispatch(logout());
    persistor.purge();
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm fixed top-0 left-0 right-0 z-20">
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
        Explified Admin
      </h1>

      <div className="relative flex gap-4" ref={menuRef}>
        <button
          onClick={() => navigate("/explified-analytics/login")}
          className="px-2 py-1 bg-cyan-200 rounded-lg"
        >
          Explified Analytics
        </button>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center space-x-2 focus:outline-none group"
        >
          <img
            src={`https://ui-avatars.com/api/?name=${user?.email || "User"}`}
            alt="Profile"
            className="w-10 h-10 rounded-full border border-gray-300 transition duration-200 group-hover:ring-2 group-hover:ring-blue-400"
          />
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              showMenu ? "rotate-180" : ""
            }`}
          />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg animate-fadeIn z-50">
            <div className="px-4 py-3 border-b text-sm text-gray-600">
              <p className="mb-1">Signed in as</p>
              <p className="font-semibold text-gray-800 truncate">
                {user?.email || "admin@explified.com"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
