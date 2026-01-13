// Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex">
      <Sidebar />
      {/* main content area – no navbar, so no pt-16 */}
      <main className="flex-1 min-h-screen bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
