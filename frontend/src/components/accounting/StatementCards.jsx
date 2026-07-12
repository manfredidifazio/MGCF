const toneStyles = {
  default: {
    wrapper: "border-gray-300 bg-white text-slate-900",
    label: "text-slate-500",
    value: "text-slate-900",
    detail: "text-slate-500",
    icon: "text-slate-600",
  },
  revenue: {
    wrapper: "border-teal-500 bg-teal-500 text-white",
    label: "text-white/80",
    value: "text-white",
    detail: "text-white/70",
    icon: "text-white",
  },
  average: {
    wrapper: "border-orange-500 bg-orange-500 text-white",
    label: "text-white/80",
    value: "text-white",
    detail: "text-white/70",
    icon: "text-white",
  },
  accountBalance: {
    wrapper: "border-blue-500 bg-blue-500 text-white",
    label: "text-white/80",
    value: "text-white",
    detail: "text-white/70",
    icon: "text-white",
  },
  globalBalance: {
    wrapper: "border-purple-500 bg-purple-500 text-white",
    label: "text-white/80",
    value: "text-white",
    detail: "text-white/70",
    icon: "text-white",
  },
  best: {
    wrapper: "border-green-500 bg-green-500 text-white",
    label: "text-white/80",
    value: "text-white",
    detail: "text-white/70",
    icon: "text-white",
  },
  worst: {
    wrapper: "border-red-500 bg-red-500 text-white",
    label: "text-white/80",
    value: "text-white",
    detail: "text-white/70",
    icon: "text-white",
  },
  danger: {
    wrapper: "border-red-500 bg-red-500 text-white",
    label: "text-white/80",
    value: "text-white",
    detail: "text-white/70",
    icon: "text-white",
  },
};

import Amount from "../ui/Amount";

export function statementSurfaceClass() {
  return "overflow-hidden rounded-xl border border-gray-300 bg-white";
}

export function StatementMetricCard({ label, value, detail, icon: Icon, tone = "default", danger = false, size = "compact", rawValue = null }) {
  const fixedKpiTones = tone === "revenue" || tone === "average" || tone === "accountBalance" || tone === "globalBalance";
  const resolvedTone = fixedKpiTones
    ? (toneStyles[tone] ?? toneStyles.default)
    : (danger ? toneStyles.danger : (toneStyles[tone] ?? toneStyles.default));
  const numericRawValue = typeof rawValue === "number" && !Number.isNaN(rawValue) ? rawValue : null;
  const isNegative = numericRawValue !== null
    ? numericRawValue < 0
    : (typeof value === "string" && value.trim().startsWith("-"));
  const sizeStyles = size === "tall"
    ? { wrapper: "px-4 py-3", label: "text-[10px]", value: "mt-1 block min-h-7 text-2xl", detail: "text-[9px]" }
    : size === "regular"
      ? { wrapper: "px-4 py-3", label: "text-[11px]", value: "mt-1.5 block min-h-8 text-2xl", detail: "text-[9px]" }
      : { wrapper: "px-4 py-2.5", label: "text-[10px]", value: "text-lg", detail: "text-[9px]" };

  return (
    <div role={danger ? "alert" : undefined} className={`rounded-xl border ${sizeStyles.wrapper} ${resolvedTone.wrapper}`}>
      <div className="flex justify-between gap-3">
        <span className={`${sizeStyles.label} font-semibold uppercase tracking-wide ${resolvedTone.label}`}>{label}</span>
        <Icon className={`h-4 w-4 shrink-0 ${resolvedTone.icon}`} />
      </div>
      {size === "compact" ? (
        <div className="mt-0.5 flex items-baseline gap-2">
          <strong className={`block min-h-5 font-bold leading-none ${sizeStyles.value} ${isNegative ? "text-slate-900" : resolvedTone.value}`}>
            <Amount>{value || "\u00A0"}</Amount>
          </strong>
          {detail && <span className={`whitespace-nowrap ${sizeStyles.detail} ${resolvedTone.detail}`}><Amount>{detail}</Amount></span>}
        </div>
      ) : (
        <>
          <strong className={`${sizeStyles.value} font-bold leading-none ${isNegative ? "text-slate-900" : resolvedTone.value}`}>
            <Amount>{value || "\u00A0"}</Amount>
          </strong>
          {detail && <span className={`mt-0.5 block ${sizeStyles.detail} ${resolvedTone.detail}`}><Amount>{detail}</Amount></span>}
        </>
      )}
    </div>
  );
}

export function StatementSplitCard({
  topLabel,
  topValue,
  topDetail,
  topIcon: TopIcon,
  topTone = "best",
  bottomLabel,
  bottomValue,
  bottomDetail,
  bottomIcon: BottomIcon,
  bottomTone = "worst",
}) {
  const topResolved = toneStyles[topTone] ?? toneStyles.best;
  const bottomResolved = toneStyles[bottomTone] ?? toneStyles.worst;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300">
      <div className={`px-3 py-1 ${topResolved.wrapper}`}>
        <div className="flex items-center justify-between gap-3">
          <span className={`text-[8px] font-semibold uppercase tracking-wide ${topResolved.label}`}>{topLabel}</span>
          <TopIcon className={`h-4 w-4 ${topResolved.icon}`} />
        </div>
        <strong className={`mt-0.5 block min-h-5 text-sm font-bold leading-none ${topResolved.value}`}>{topValue || "\u00A0"}</strong>
        <span className={`block text-[8px] ${topResolved.detail}`}>{topDetail}</span>
      </div>

      <div className={`border-t border-white/20 px-3 py-1 ${bottomResolved.wrapper}`}>
        <div className="flex items-center justify-between gap-3">
          <span className={`text-[8px] font-semibold uppercase tracking-wide ${bottomResolved.label}`}>{bottomLabel}</span>
          <BottomIcon className={`h-4 w-4 ${bottomResolved.icon}`} />
        </div>
        <strong className={`mt-0.5 block min-h-5 text-sm font-bold leading-none ${bottomResolved.value}`}>{bottomValue || "\u00A0"}</strong>
        <span className={`block text-[8px] ${bottomResolved.detail}`}>{bottomDetail}</span>
      </div>
    </div>
  );
}