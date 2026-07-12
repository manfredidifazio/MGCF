import Topbar from "../components/layout/Topbar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_#eef2ff_0%,_#f8fafc_42%,_#eef4ff_100%)]">

      <Topbar />

      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  );
}
