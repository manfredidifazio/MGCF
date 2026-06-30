import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="flex-1 p-8 overflow-auto">

          {children}

        </main>

      </div>

    </div>
  );
}