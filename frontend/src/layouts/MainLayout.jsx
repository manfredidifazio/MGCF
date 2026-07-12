import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";
import { useState } from "react";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* SIDEBAR - hidden on mobile, fixed on desktop */}
      <div className="hidden md:block">
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

      {/* TOPBAR */}
      <Topbar sidebarOpen={sidebarOpen} onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* CONTENUTO */}
      <main className="md:ml-64 min-w-0 p-2">
        <Outlet />
      </main>
    </div>
  );
}
