import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";
import { useState } from "react";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mgcf-app-shell min-h-screen bg-[#f8f8f8]">
      {/* SIDEBAR - fixed on desktop, hidden on mobile but visible as drawer */}
      <aside className="mgcf-app-sidebar fixed left-0 top-0 h-screen w-64 z-50 hidden md:block border-r border-gray-300 bg-white overflow-y-auto shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <Sidebar />
      </aside>

      {/* MOBILE OVERLAY when sidebar is open - below topbar */}
      {sidebarOpen && (
        <div
          className="fixed left-0 right-0 top-11 bottom-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR DRAWER - z-[9999] to stay above everything, under topbar */}
      <div
        className={`fixed left-0 top-11 h-[calc(100vh-44px)] w-64 transform transition-transform duration-300 md:hidden z-[9999] bg-white border-r border-gray-300 overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <Sidebar />
      </div>

      {/* TOPBAR - responsive margin */}
      <Topbar className="mgcf-app-topbar" sidebarOpen={sidebarOpen} onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* CONTENUTO - margin only on desktop, padding-top on mobile for fixed topbar */}
      <main className="mgcf-app-main md:ml-64 pt-11 md:pt-0 min-w-0 p-2">
        {/* Mobile spacer between topbar and content */}
        <div className="md:hidden h-2" />
        {/* Desktop spacer between topbar and content */}
        <div className="hidden md:block h-2" />
        <Outlet />
      </main>
    </div>
  );
}
