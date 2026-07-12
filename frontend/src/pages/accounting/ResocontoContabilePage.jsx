import {
  AlertTriangle,
  Banknote,
  BarChart3,
  ClipboardList,
  FolderKanban,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { StatementMetricCard, statementSurfaceClass } from "../../components/accounting/StatementCards";
import Amount from "../../components/ui/Amount";
import { getAccounts } from "../../services/accountService";
import { getAccountStatements } from "../../services/accountStatementService";
import { getAccredits } from "../../services/accreditService";

const currency = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const monthLabels = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function parseAmount(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;

  let normalized = trimmed;
  if (trimmed.includes(",")) {
    normalized = trimmed.replace(/\./g, "").replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function periodKey(year, month, accountId) {
  return `${year}-${month}-${accountId}`;
}

function amountClass(value) {
  if (value == null) return "text-slate-400";
  if (value < 0) return "text-red-600 font-semibold";
  return "text-slate-900 font-semibold";
}

function monthShortLabel(monthNumber) {
  const monthName = monthLabels[Number(monthNumber) - 1] ?? monthNumber;
  return monthName.slice(0, 3).toUpperCase();
}

function axisAmountLabel(value, { signed = false } = {}) {
  const abs = Math.abs(value);
  const compact = abs >= 1000;
  const formatted = compact
    ? `${(value / 1000).toFixed(1).replace(".", ",")}k €`
    : `${Math.round(value).toLocaleString("it-IT")} €`;
  if (signed && value > 0) return `+${formatted}`;
  return formatted;
}

function TrendPanel({
  title,
  labels,
  values,
  lineColor,
  gradientId,
  showZeroLine = false,
  signedAxis = false,
}) {
  if (!values.length) return null;

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const safeMin = showZeroLine ? Math.min(minValue, 0) : minValue;
  const safeMax = showZeroLine ? Math.max(maxValue, 0) : maxValue;
  const range = safeMax - safeMin || 1;
  const topY = 4;
  const bottomY = 34;
  const chartHeight = bottomY - topY;

  const pointsArray = values.map((value, index) => {
    const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
    const y = bottomY - ((value - safeMin) / range) * chartHeight;
    return { x, y };
  });

  const points = pointsArray.map((item) => `${item.x},${item.y}`).join(" ");
  const area = `0,${bottomY} ${points} 100,${bottomY}`;
  const zeroY = bottomY - ((0 - safeMin) / range) * chartHeight;
  const axisMid = safeMin + (safeMax - safeMin) / 2;

  return (
    <div className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
        <span className="text-[10px] text-slate-400">{labels.length} periodi</span>
      </div>
      <div className="mt-2 flex gap-3">
        <div className="min-w-0 flex-1">
          <svg viewBox="0 0 100 38" preserveAspectRatio="none" className="h-28 w-full">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.22" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <line x1="0" y1={bottomY} x2="100" y2={bottomY} stroke="#cbd5e1" strokeWidth="0.4" />
            <line x1="0" y1={topY + chartHeight / 3} x2="100" y2={topY + chartHeight / 3} stroke="#e2e8f0" strokeWidth="0.35" />
            <line x1="0" y1={topY + (chartHeight / 3) * 2} x2="100" y2={topY + (chartHeight / 3) * 2} stroke="#e2e8f0" strokeWidth="0.35" />
            {showZeroLine && zeroY >= topY && zeroY <= bottomY && (
              <line x1="0" y1={zeroY} x2="100" y2={zeroY} stroke="#dc2626" strokeWidth="0.45" />
            )}
            <polygon points={area} fill={`url(#${gradientId})`} />
            <polyline points={points} fill="none" stroke={lineColor} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            {pointsArray.map((item, index) => (
              <circle key={index} cx={item.x} cy={item.y} r="0.8" fill={lineColor} />
            ))}
          </svg>

          <div className="mt-1 grid text-[10px] font-medium uppercase tracking-wide text-slate-500" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>
            {labels.map((label, index) => (
              <span key={`${label}-${index}`} className="text-center">{label}</span>
            ))}
          </div>
        </div>

        <div className="w-16 shrink-0 py-1 text-right text-[10px] tabular-nums text-slate-500">
          <div className="flex h-full flex-col justify-between">
            <span>{axisAmountLabel(safeMax, { signed: signedAxis })}</span>
            <span>{axisAmountLabel(axisMid, { signed: signedAxis })}</span>
            <span>{axisAmountLabel(safeMin, { signed: signedAxis })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportMatrix({
  title,
  subtitle,
  firstColumnLabel,
  rowKey,
  rows,
  totals,
  accountColumns,
}) {
  const template = `92px repeat(${accountColumns.length}, minmax(86px, 1fr)) 128px 128px 128px`;

  return (
    <div className="rounded-xl border border-gray-300 bg-white shadow-sm">
      <div className="border-b border-gray-300 bg-slate-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[760px] p-2">
          <div className="grid items-center gap-0 border-b border-gray-300 bg-slate-50 px-1 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500" style={{ gridTemplateColumns: template }}>
            <span className="rounded-md bg-white px-2 py-1 text-left">{firstColumnLabel}</span>
            {accountColumns.map((account) => (
              <span key={`head-${account.id}`} className="truncate rounded-md bg-white pl-1 pr-1 py-1 text-left text-slate-700">{account.name}</span>
            ))}
            <span className="ml-1 rounded-md bg-blue-500 px-2 py-1 text-center text-white">Entrate</span>
            <span className="ml-1 rounded-md bg-amber-500 px-2 py-1 text-center text-white">Uscite</span>
            <span className="ml-1 rounded-md bg-emerald-500 px-2 py-1 text-center text-white">Ricavo</span>
          </div>

          <div className="divide-y divide-gray-200">
            {rows.map((row) => (
              <div key={String(row[rowKey])} className="grid items-center gap-0 bg-white px-1 py-2" style={{ gridTemplateColumns: template }}>
                <span className="px-1.5 text-sm font-semibold text-slate-700">{row[rowKey]}</span>
                {accountColumns.map((account) => {
                  const value = row.byAccount[String(account.id)];
                  return (
                    <span key={`${row[rowKey]}-${account.id}`} className={`pl-0 pr-1 py-1 text-left text-sm tabular-nums ${amountClass(value)}`}>
                      <Amount>{value == null ? "-" : currency.format(value)}</Amount>
                    </span>
                  );
                })}
                <span className="px-1.5 py-1 text-right text-sm font-semibold tabular-nums text-blue-700">
                  <Amount>{currency.format(row.income)}</Amount>
                </span>
                <span className="px-1.5 py-1 text-right text-sm font-semibold tabular-nums text-amber-700">
                  <Amount>{currency.format(row.expense)}</Amount>
                </span>
                <span className={`px-1.5 py-1 text-right text-sm font-semibold tabular-nums ${row.net < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  <Amount>{currency.format(row.net)}</Amount>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-1 grid items-center gap-0 border-t border-gray-300 bg-slate-50 px-1 py-2" style={{ gridTemplateColumns: template }}>
            <span className="px-1.5 text-sm font-semibold text-slate-800">Totale</span>
            {accountColumns.map((account) => {
              const value = totals.byAccount[String(account.id)] ?? 0;
              return (
                <span key={`tot-${account.id}`} className={`pl-0 pr-1 py-1 text-left text-sm font-semibold tabular-nums ${amountClass(value)}`}>
                  <Amount>{currency.format(value)}</Amount>
                </span>
              );
            })}
            <span className="px-1.5 py-1 text-right text-sm font-semibold tabular-nums text-blue-700">
              <Amount>{currency.format(totals.income)}</Amount>
            </span>
            <span className="px-1.5 py-1 text-right text-sm font-semibold tabular-nums text-amber-700">
              <Amount>{currency.format(totals.expense)}</Amount>
            </span>
            <span className={`px-1.5 py-1 text-right text-sm font-semibold tabular-nums ${totals.net < 0 ? "text-red-600" : "text-emerald-600"}`}>
              <Amount>{currency.format(totals.net)}</Amount>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResocontoContabilePage() {
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [accredits, setAccredits] = useState([]);
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const view = searchParams.get("view") === "year" ? "year" : "general";
  const selectedYear = searchParams.get("year") ?? "";

  useEffect(() => {
    let active = true;

    Promise.all([getAccounts(), getAccredits(), getAccountStatements()])
      .then(([accountData, accreditData, statementData]) => {
        if (!active) return;
        setAccounts(accountData);
        setAccredits(accreditData);
        setStatements(statementData);
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.response?.data?.message ?? "Impossibile caricare il resoconto contabile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const accountColumns = useMemo(() => {
    const map = new Map();

    accounts.forEach((account) => {
      map.set(String(account.id), { id: account.id, name: account.name, color: account.color });
    });

    accredits.forEach((item) => {
      const key = String(item.accountId ?? "");
      if (!key || map.has(key)) return;
      map.set(key, { id: item.accountId, name: item.accountName ?? `Conto ${key}`, color: "#64748b" });
    });

    statements.forEach((item) => {
      const key = String(item.accountId ?? "");
      if (!key || map.has(key)) return;
      map.set(key, { id: item.accountId, name: item.accountName ?? `Conto ${key}`, color: item.accountColor ?? "#64748b" });
    });

    return [...map.values()].sort((first, second) => String(first.name).localeCompare(String(second.name), "it"));
  }, [accounts, accredits, statements]);

  const accreditsByPeriod = useMemo(() => {
    const map = {};

    accredits.forEach((item) => {
      const movementDate = String(item.movementDate);
      const year = movementDate.slice(0, 4);
      const month = movementDate.slice(5, 7);
      const accountId = String(item.accountId ?? "");
      if (!year || !month || !accountId) return;
      const key = periodKey(year, month, accountId);
      map[key] = (map[key] ?? 0) + parseAmount(item.amount);
    });

    return map;
  }, [accredits]);

  const statementRevenueByPeriod = useMemo(() => {
    const map = {};

    statements.forEach((item) => {
      const period = String(item.period).slice(0, 7);
      const year = period.slice(0, 4);
      const month = period.slice(5, 7);
      const accountId = String(item.accountId ?? "");
      if (!year || !month || !accountId) return;

      const currentBalance = parseAmount(item.currentBalance);
      const previousBalance = parseAmount(item.previousBalance);
      map[periodKey(year, month, accountId)] = currentBalance - previousBalance;
    });

    return map;
  }, [statements]);

  const years = useMemo(() => {
    return [...new Set([
      ...accredits.map((item) => String(item.movementDate).slice(0, 4)),
      ...statements.map((item) => String(item.period).slice(0, 4)),
    ].filter(Boolean))]
      .sort((first, second) => Number(second) - Number(first));
  }, [accredits, statements]);

  const currentYear = useMemo(() => {
    if (view !== "year") return "";
    if (years.includes(selectedYear)) return selectedYear;
    return years[0] ?? "";
  }, [selectedYear, view, years]);

  const generalRows = useMemo(() => {
    return [...years]
      .sort((first, second) => Number(first) - Number(second))
      .map((year) => {
        const row = {
          year,
          byAccount: {},
          income: 0,
          expense: 0,
          net: 0,
        };

        accountColumns.forEach((account) => {
          const accountKey = String(account.id);
          let accountYearNet = 0;
          let hasRevenue = false;

          for (let month = 1; month <= 12; month += 1) {
            const monthKey = String(month).padStart(2, "0");
            const key = periodKey(year, monthKey, accountKey);
            const accreditsTotal = accreditsByPeriod[key] ?? 0;
            const accountRevenue = statementRevenueByPeriod[key];

            row.income += accreditsTotal;

            if (accountRevenue === undefined) continue;
            hasRevenue = true;
            accountYearNet += accountRevenue;
            row.net += accountRevenue;
          }

          if (hasRevenue) {
            row.byAccount[accountKey] = accountYearNet;
          }
        });

        row.expense = row.income - row.net;
        return row;
      });
  }, [years, accountColumns, accreditsByPeriod, statementRevenueByPeriod]);

  const generalTotals = useMemo(() => {
    const byAccount = {};
    let income = 0;
    let expense = 0;
    let net = 0;

    generalRows.forEach((row) => {
      accountColumns.forEach((account) => {
        const key = String(account.id);
        byAccount[key] = (byAccount[key] ?? 0) + (row.byAccount[key] ?? 0);
      });
      income += row.income;
      expense += row.expense;
      net += row.net;
    });

    return { byAccount, income, expense, net };
  }, [accountColumns, generalRows]);

  const generalAverages = useMemo(() => {
    if (generalRows.length === 0) return { income: 0, expense: 0, net: 0 };
    const count = generalRows.length;
    return {
      income: generalTotals.income / count,
      expense: generalTotals.expense / count,
      net: generalTotals.net / count,
    };
  }, [generalRows.length, generalTotals]);

  const monthRows = useMemo(() => {
    const rows = monthLabels.map((label, index) => ({
      monthLabel: label,
      monthKey: String(index + 1).padStart(2, "0"),
      byAccount: {},
      income: 0,
      expense: 0,
      net: 0,
    }));

    if (!currentYear) return rows;

    rows.forEach((row) => {
      accountColumns.forEach((account) => {
        const accountKey = String(account.id);
        const key = periodKey(currentYear, row.monthKey, accountKey);
        const accreditsTotal = accreditsByPeriod[key] ?? 0;
        const accountRevenue = statementRevenueByPeriod[key];

        row.income += accreditsTotal;
        if (accountRevenue === undefined) return;

        row.byAccount[accountKey] = accountRevenue;
        row.net += accountRevenue;
      });

      row.expense = row.income - row.net;
    });

    return rows;
  }, [currentYear, accountColumns, accreditsByPeriod, statementRevenueByPeriod]);

  const monthTotals = useMemo(() => {
    const byAccount = {};
    let income = 0;
    let expense = 0;
    let net = 0;

    monthRows.forEach((row) => {
      accountColumns.forEach((account) => {
        const key = String(account.id);
        byAccount[key] = (byAccount[key] ?? 0) + (row.byAccount[key] ?? 0);
      });
      income += row.income;
      expense += row.expense;
      net += row.net;
    });

    return { byAccount, income, expense, net };
  }, [accountColumns, monthRows]);

  const monthAverages = useMemo(() => {
    if (monthRows.length === 0) return { income: 0, expense: 0, net: 0 };
    const count = monthRows.length;
    return {
      income: monthTotals.income / count,
      expense: monthTotals.expense / count,
      net: monthTotals.net / count,
    };
  }, [monthRows.length, monthTotals]);

  const showYearTable = view === "year" && currentYear;

  const activeRows = showYearTable ? monthRows : generalRows;
  const activeTotals = showYearTable ? monthTotals : generalTotals;
  const activeAverages = showYearTable ? monthAverages : generalAverages;

  const bestRow = useMemo(() => {
    if (!activeRows.length) return null;
    return activeRows.reduce((best, row) => (row.net > best.net ? row : best), activeRows[0]);
  }, [activeRows]);

  const worstRow = useMemo(() => {
    if (!activeRows.length) return null;
    return activeRows.reduce((worst, row) => (row.net < worst.net ? row : worst), activeRows[0]);
  }, [activeRows]);

  const chartLabels = useMemo(() => {
    if (showYearTable) return monthRows.map((row) => monthShortLabel(row.monthKey));
    return generalRows.map((row) => String(row.year));
  }, [showYearTable, monthRows, generalRows]);

  const chartNetValues = useMemo(() => activeRows.map((row) => row.net), [activeRows]);
  const chartIncomeValues = useMemo(() => activeRows.map((row) => row.income), [activeRows]);

  return (
    <div className={statementSurfaceClass()}>
      <div className="bg-[#e4e4e4] px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 shrink-0 text-black" />
              <h1 className="text-xl text-black">Resoconto contabile</h1>
            </div>
            <p className="mt-1 text-sm text-black">Panoramica ricavi per conto con viste generale e annuale.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link
              to="/accounting/resoconto-contabile?view=general"
              className="mgcf-report-general-btn inline-flex h-9 items-center gap-2 rounded-md border border-orange-500 bg-orange-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              <FolderKanban className="h-4 w-4 text-white" />
              Resoconto generale
            </Link>
          </div>
        </div>
      </div>

      <div className="p-3">
        {message && <p className="mgcf-toast mgcf-toast--error px-4 py-3 text-sm font-semibold">{message}</p>}

        {loading ? (
          <p className="px-5 py-5 text-sm text-slate-500">Caricamento...</p>
        ) : accountColumns.length === 0 ? (
          <p className="px-5 py-5 text-sm text-slate-500">Nessun conto disponibile.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatementMetricCard
                label={`Ricavo totale ${showYearTable ? currentYear : "multi-anno"}`}
                value={currency.format(activeTotals.net)}
                rawValue={activeTotals.net}
                icon={activeTotals.net < 0 ? AlertTriangle : TrendingUp}
                tone="revenue"
                size="regular"
              />
              <StatementMetricCard
                label={`Media ricavo ${showYearTable ? "mese" : "anno"}`}
                value={currency.format(activeAverages.net)}
                rawValue={activeAverages.net}
                icon={BarChart3}
                tone="average"
                size="regular"
              />
              <StatementMetricCard
                label={`Entrate ${showYearTable ? currentYear : "totali"}`}
                value={currency.format(activeTotals.income)}
                rawValue={activeTotals.income}
                icon={Banknote}
                tone="accountBalance"
                size="regular"
              />
              <StatementMetricCard
                label={`Uscite ${showYearTable ? currentYear : "totali"}`}
                value={currency.format(activeTotals.expense)}
                rawValue={activeTotals.expense}
                icon={AlertTriangle}
                tone="globalBalance"
                size="regular"
              />
            </div>

            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatementMetricCard
                label="Miglior periodo"
                value={bestRow ? currency.format(bestRow.net) : "-"}
                rawValue={bestRow?.net ?? null}
                detail={bestRow ? String(showYearTable ? bestRow.monthLabel : bestRow.year) : "Nessun dato"}
                icon={TrendingUp}
                tone={bestRow && bestRow.net < 0 ? "danger" : "best"}
                size="compact"
              />
              <StatementMetricCard
                label="Peggior periodo"
                value={worstRow ? currency.format(worstRow.net) : "-"}
                rawValue={worstRow?.net ?? null}
                detail={worstRow ? String(showYearTable ? worstRow.monthLabel : worstRow.year) : "Nessun dato"}
                icon={AlertTriangle}
                tone={worstRow && worstRow.net < 0 ? "danger" : "worst"}
                size="compact"
              />
              <StatementMetricCard
                label={`Media entrate ${showYearTable ? "mese" : "anno"}`}
                value={currency.format(activeAverages.income)}
                rawValue={activeAverages.income}
                icon={Banknote}
                tone="default"
                size="compact"
              />
              <StatementMetricCard
                label={`Media uscite ${showYearTable ? "mese" : "anno"}`}
                value={currency.format(activeAverages.expense)}
                rawValue={activeAverages.expense}
                icon={BarChart3}
                tone="default"
                size="compact"
              />
            </div>

            <div className="mt-2 grid grid-cols-1 gap-3 xl:grid-cols-2">
              <TrendPanel
                title={`Andamento ricavo ${showYearTable ? `anno ${currentYear}` : "pluriennale"}`}
                labels={chartLabels}
                values={chartNetValues}
                lineColor="#16a34a"
                gradientId="mgcfReportNet"
                showZeroLine
                signedAxis
              />
              <TrendPanel
                title={`Andamento entrate ${showYearTable ? `anno ${currentYear}` : "pluriennale"}`}
                labels={chartLabels}
                values={chartIncomeValues}
                lineColor="#2563eb"
                gradientId="mgcfReportIncome"
              />
            </div>

            {!showYearTable ? (
              <div className="mt-3">
                <ReportMatrix
                  title="Resoconto generale"
                  subtitle="Somma annuale per conto con entrate, uscite e ricavo"
                  firstColumnLabel="Anno"
                  rowKey="year"
                  rows={generalRows}
                  totals={generalTotals}
                  accountColumns={accountColumns}
                />
              </div>
            ) : (
              <div className="mt-3">
                <ReportMatrix
                  title={`Resoconto per anno ${currentYear}`}
                  subtitle="Dettaglio mensile per conto con entrate, uscite e ricavo"
                  firstColumnLabel="Mese"
                  rowKey="monthLabel"
                  rows={monthRows}
                  totals={monthTotals}
                  accountColumns={accountColumns}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
