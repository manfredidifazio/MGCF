import Topbar from "../components/layout/Topbar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col">

      <Topbar />

      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  );
}
