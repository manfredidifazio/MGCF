export default function LoginBackground({ children }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f7f6f3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#fde68a33,transparent_35%),radial-gradient(circle_at_bottom_right,#f59e0b22,transparent_35%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-8 py-8">
        {children}
      </div>
    </main>
  );
}
