import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} /> {/* AQUÍ PASAMOS closeSidebar */}
      <div className="flex flex-col w-full">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 bg-blue-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
