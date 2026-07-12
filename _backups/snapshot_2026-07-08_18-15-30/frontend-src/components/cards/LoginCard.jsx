export default function LoginCard({ children }) {
  return (
    <section
      className="
        w-full
        max-w-[480px]
        rounded-xl
        border
        border-white/70
        bg-white/85
        p-12
        backdrop-blur-xl
      "
    >
      {children}
    </section>
  );
}
