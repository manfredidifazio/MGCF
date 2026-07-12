import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";
import { useState } from "react";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* SIDEBAR - fixed on desktop, hidden on mobile */}
      <div className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:z-50">
        <Sidebar />
      </div>

      {/* MOBILE OVERLAY when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR DRAWER */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 transform transition-transform duration-300 md:hidden z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* TOPBAR - fixed top padding for desktop */}
      <Topbar sidebarOpen={sidebarOpen} onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* CONTENUTO - margin only on desktop */}
      <main className="md:ml-64 min-w-0 p-2">
        <Outlet />
      </main>
    </div>
  );
}
