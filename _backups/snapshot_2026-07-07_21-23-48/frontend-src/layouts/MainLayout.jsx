import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#f7f6f3]">

      {/* TOPBAR */}
      <Topbar />

      <div className="flex">

        {/* SIDEBAR */}
        <Sidebar />

        {/* CONTENUTO */}
        <main className="min-w-0 flex-1 p-2">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
