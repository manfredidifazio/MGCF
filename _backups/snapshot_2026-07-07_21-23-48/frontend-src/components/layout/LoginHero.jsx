export default function LoginHero() {
  return (
    <section className="relative hidden flex-1 items-center justify-center xl:flex">
      <div className="absolute h-[420px] w-[420px] rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative w-[500px] rounded-xl border border-white/60 bg-white/80 p-10 backdrop-blur">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="h-3 w-36 rounded-full bg-amber-500" />
            <div className="mt-4 h-2 w-24 rounded-full bg-slate-200" />
          </div>

          <div className="rounded-lg bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
            MGCF
          </div>
        </div>

        <div className="mb-10 flex items-end justify-between">
          {[35, 55, 85, 65, 95, 70].map((h) => (
            <div
              key={h}
              className="w-10 rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-300"
              style={{ height: `${h * 2}px` }}
            />
          ))}
        </div>

        <div className="space-y-4">
          <div className="h-2 rounded-full bg-slate-200" />
          <div className="h-2 w-3/4 rounded-full bg-slate-200" />
          <div className="h-2 w-1/2 rounded-full bg-slate-200" />
        </div>
      </div>
    </section>
  );
}
