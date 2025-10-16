import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full">
        <Navbar />
        <div className="pt-16 min-h-screen bg-gray-50">
          <Outlet /> {/* or your routed pages */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
