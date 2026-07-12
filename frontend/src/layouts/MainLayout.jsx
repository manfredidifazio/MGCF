import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* SIDEBAR - fixed, full height */}
      <Sidebar />

      {/* TOPBAR */}
      <Topbar />

      {/* CONTENUTO */}
      <main className="ml-64 min-w-0 p-2">
        <Outlet />
      </main>
    </div>
  );
}
