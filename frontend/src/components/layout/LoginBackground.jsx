export default function LoginBackground({ children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.18),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.15),transparent_50%)]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        {children}
      </div>
    </main>
  );
}
