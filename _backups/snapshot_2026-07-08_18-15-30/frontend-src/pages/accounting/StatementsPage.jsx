import {
  Banknote,
  BarChart,
  ChevronDown,
  ChevronRight,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getAccounts } from "../../services/accountService";
import { getAccountStatements } from "../../services/accountStatementService";
import { getAccredits } from "../../services/accreditService";
import { accountingYears } from "../../utils/accountingPeriods";
import { STATEMENT_LABELS } from "../../utils/statementLabels";
import { formatCurrencyAmount, hasMeaningfulAmount } from "../../utils/statementMetrics";

const currency = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const months = [
  ["01", "Gennaio"], ["02", "Febbraio"], ["03", "Marzo"], ["04", "Aprile"],
  ["05", "Maggio"], ["06", "Giugno"], ["07", "Luglio"], ["08", "Agosto"],
  ["09", "Settembre"], ["10", "Ottobre"], ["11", "Novembre"], ["12", "Dicembre"],
];

export default function StatementsPage() {
  const currentYear = String(new Date().getFullYear());
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(() => String(new Date().getMonth() + 1).padStart(2, "0"));
  const [accounts, setAccounts] = useState([]);
  const [statements, setStatements] = useState([]);
  const [accredits, setAccredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([getAccounts(), getAccountStatements(), getAccredits()])
      .then(([accountData, statementData, accreditData]) => {
        setAccounts(accountData);
        setStatements(statementData);
        setAccredits(accreditData);
      })
      .catch((error) => setMessage(error.response?.data?.message ?? "Impossibile caricare gli estratti conto."))
      .finally(() => setLoading(false));
  }, []);

  const years = useMemo(() => {
    return accountingYears(
      statements.map((item) => item.period),
      accredits.map((item) => item.movementDate),
    ).reverse();
  }, [accredits, statements]);

  const summaries = useMemo(() => accounts.map((account) => {
    const rows = statements
      .filter((item) => String(item.accountId) === String(account.id) && String(item.period).slice(0, 4) === year)
      .sort((first, second) => String(second.period).localeCompare(String(first.period)));
    const latest = rows[0] ?? null;
    const change = rows.reduce((sum, item) => sum + Number(item.currentBalance) - Number(item.previousBalance), 0);
    return { account, rows, latest, change };
  }), [accounts, statements, year]);

  const accreditCountByMonth = useMemo(() => accredits.reduce((result, item) => {
    const date = String(item.movementDate);
    if (date.slice(0, 4) !== year) return result;
    const value = date.slice(5, 7);
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {}), [accredits, year]);

  const totalAssets = summaries.reduce((sum, item) => sum + Number(item.latest?.currentBalance ?? 0), 0);
  const totalChange = summaries.reduce((sum, item) => sum + item.change, 0);
  const completedMonths = summaries.reduce((sum, item) => sum + item.rows.length, 0);
  const averageChange = completedMonths ? totalChange / completedMonths : 0;
  const monthlyCurrentAmounts = useMemo(() => statements
    .filter((item) => String(item.period).slice(0, 4) === year)
    .map((item) => ({
      period: String(item.period).slice(0, 7),
      value: Number(item.currentBalance),
      accountName: accounts.find((account) => String(account.id) === String(item.accountId))?.name ?? "",
    })), [accounts, statements, year]);
  const monthlyChanges = useMemo(() => statements
    .filter((item) => String(item.period).slice(0, 4) === year)
    .map((item) => ({
      period: String(item.period).slice(0, 7),
      value: Number(item.currentBalance) - Number(item.previousBalance),
      accountName: accounts.find((account) => String(account.id) === String(item.accountId))?.name ?? "",
    })), [accounts, statements, year]);
  const bestCurrent = monthlyCurrentAmounts.length
    ? monthlyCurrentAmounts.reduce((best, item) => (item.value > best.value ? item : best), monthlyCurrentAmounts[0])
    : null;
  const worstCurrent = monthlyCurrentAmounts.length
    ? monthlyCurrentAmounts.reduce((worst, item) => (item.value < worst.value ? item : worst), monthlyCurrentAmounts[0])
    : null;
  const bestRevenue = monthlyChanges.length
    ? monthlyChanges.reduce((best, item) => (item.value > best.value ? item : best), monthlyChanges[0])
    : null;
  const worstRevenue = monthlyChanges.length
    ? monthlyChanges.reduce((worst, item) => (item.value < worst.value ? item : worst), monthlyChanges[0])
    : null;
  const hasRevenue = hasMeaningfulAmount(totalChange);
  const hasAverage = hasMeaningfulAmount(averageChange);
  const hasGlobal = hasMeaningfulAmount(totalAssets);
  const hasBestCurrent = bestCurrent && hasMeaningfulAmount(bestCurrent.value);
  const hasWorstCurrent = worstCurrent && hasMeaningfulAmount(worstCurrent.value);
  const hasBest = bestRevenue && hasMeaningfulAmount(bestRevenue.value);
  const hasWorst = worstRevenue && hasMeaningfulAmount(worstRevenue.value);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><FileText className="h-5 w-5 shrink-0 text-amber-600" /><h1 className="text-xl font-semibold text-slate-900">Gestisci estratti conto</h1></div>
          <p className="mt-1 text-sm text-slate-500">Scegli un conto per gestire i dodici mesi dell'anno.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SelectField label="Anno">
            <select value={year} onChange={(event) => { setYear(event.target.value); setMonth(""); }} className="h-9 w-24 appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-8 text-xs outline-none focus:border-amber-500">
              {years.map((value) => <option key={value}>{value}</option>)}
            </select>
          </SelectField>
          <SelectField label="Mese da gestire">
            <select value={month} onChange={(event) => setMonth(event.target.value)} className="h-9 w-48 appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-8 text-xs outline-none focus:border-amber-500">
              <option value="">Tutti i mesi</option>
              {months.map(([value, label]) => <option key={value} value={value}>{label}{accreditCountByMonth[value] ? ` · ${accreditCountByMonth[value]} accrediti` : ""}</option>)}
            </select>
          </SelectField>
        </div>
      </div>
      </div>

      <div className="p-3">
      {message && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Stat label={`${STATEMENT_LABELS.revenue} ${year}`} value={formatCurrencyAmount(totalChange, currency, { signed: true })} icon={totalChange < 0 ? AlertTriangle : BarChart} danger={hasRevenue && totalChange < 0} tone={hasRevenue ? "revenue" : "default"} />
        <Stat label={STATEMENT_LABELS.averageRevenue} value={formatCurrencyAmount(averageChange, currency, { signed: true })} icon={FileText} danger={hasAverage && averageChange < 0} tone={hasAverage ? "average" : "default"} />
        <Stat label="Saldo generale" value={formatCurrencyAmount(totalAssets, currency)} icon={Banknote} danger={hasGlobal && totalAssets < 0} tone={hasGlobal ? "globalBalance" : "default"} />
        <Stat label="Mensilita registrate" value={String(completedMonths)} icon={FileText} />
      </div>

      <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
        <BestWorstStat
          bestLabel="Miglior estratto conto"
          bestValue={bestCurrent ? formatCurrencyAmount(bestCurrent.value, currency) : ""}
          bestDetail={hasBestCurrent ? monthAccountLabel(bestCurrent.period, bestCurrent.accountName) : "Nessun mese compilato"}
          bestDanger={hasBestCurrent && bestCurrent.value < 0}
          worstLabel="Peggior estratto conto"
          worstValue={worstCurrent ? formatCurrencyAmount(worstCurrent.value, currency) : ""}
          worstDetail={hasWorstCurrent ? monthAccountLabel(worstCurrent.period, worstCurrent.accountName) : "Nessun mese compilato"}
          worstDanger={hasWorstCurrent && worstCurrent.value < 0}
        />
        <BestWorstStat
          bestLabel="Migliore ricavo"
          bestValue={bestRevenue ? formatCurrencyAmount(bestRevenue.value, currency, { signed: true }) : ""}
          bestDetail={hasBest ? monthAccountLabel(bestRevenue.period, bestRevenue.accountName) : "Nessun mese compilato"}
          bestDanger={hasBest && bestRevenue.value < 0}
          worstLabel="Peggiore ricavo"
          worstValue={worstRevenue ? formatCurrencyAmount(worstRevenue.value, currency, { signed: true }) : ""}
          worstDetail={hasWorst ? monthAccountLabel(worstRevenue.period, worstRevenue.accountName) : "Nessun mese compilato"}
          worstDanger={hasWorst && worstRevenue.value < 0}
        />
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-3"><h2 className="text-sm font-semibold text-slate-900">Conti</h2><p className="mt-0.5 text-xs text-slate-500">Ogni conto dispone di una pagina annuale con dodici righe mensili.</p></div>
        {loading ? <p className="px-5 py-5 text-sm text-slate-500">Caricamento...</p> : (
          <div className="divide-y divide-slate-100">
            {summaries.map(({ account, latest, change, rows }) => {
              const color = account.color || "#64748b";
              return (
                <Link key={account.id} to={`/accounting/statements/${account.id}?year=${year}${month ? `&month=${month}` : ""}`} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-6 px-5 py-3 transition-colors hover:bg-amber-50">
                  <span className="flex min-w-0 items-center gap-3 font-semibold" style={{ color }}><i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} /><span className="truncate">{account.name}</span></span>
                  <span className="text-xs text-slate-400">{rows.length}/12 mesi</span>
                  <span className={`text-sm font-semibold tabular-nums ${Number(latest?.currentBalance ?? 0) < 0 ? "text-red-600" : "text-slate-900"}`}>{latest ? currency.format(Number(latest.currentBalance)) : "—"}</span>
                  <span className="flex items-center gap-3"><strong className={`text-xs tabular-nums ${change < 0 ? "text-red-600" : "text-emerald-600"}`}>{rows.length ? `${change >= 0 ? "+" : ""}${currency.format(change)}` : ""}</strong><ChevronRight className="h-4 w-4 text-slate-400" /></span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, danger = false, detail, tone = "default" }) {
  const toneClasses = {
    default: "border-slate-200 bg-white text-slate-900",
    revenue: "border-emerald-200 bg-emerald-50 text-emerald-800",
    average: "border-amber-200 bg-amber-50 text-amber-800",
    globalBalance: "border-blue-200 bg-blue-50 text-blue-800",
    best: "border-lime-200 bg-lime-50 text-lime-800",
    worst: "border-red-300 bg-red-50 text-red-700",
  };
  const color = danger ? "border-red-300 bg-red-50 text-red-700" : (toneClasses[tone] ?? toneClasses.default);
  const labelColor = danger ? "text-red-600" : "text-slate-500";
  const iconColor = danger ? "text-red-600" : "text-slate-600";
  const detailColor = danger ? "text-red-600" : "text-slate-500";

  return <div role={danger ? "alert" : undefined} className={`rounded-lg border px-4 py-3 ${color}`}><div className="flex justify-between"><span className={`text-[10px] font-medium uppercase tracking-wide ${labelColor}`}>{label}</span><Icon className={`h-4 w-4 ${iconColor}`} /></div><strong className="mt-1.5 block min-h-8 text-xl">{value || "\u00A0"}</strong>{detail && <span className={`mt-0.5 block text-[10px] ${detailColor}`}>{detail}</span>}</div>;
}

function BestWorstStat({
  bestLabel,
  bestValue,
  bestDetail,
  bestDanger = false,
  worstLabel,
  worstValue,
  worstDetail,
  worstDanger = false,
}) {
  const bestEmpty = !bestValue;
  const worstEmpty = !worstValue;

  return (
    <div className="bg-white py-3">
      <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50/60">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{bestLabel}</span>
            <BarChart className={`h-4 w-4 ${bestDanger ? "text-red-600" : "text-emerald-600"}`} />
          </div>
          <strong className={`mt-1 block min-h-7 text-lg ${bestDanger ? "text-red-700" : "text-emerald-700"}`}>{bestValue || "\u00A0"}</strong>
          <span className={`block text-[10px] ${bestEmpty ? "text-slate-400" : "text-slate-500"}`}>{bestDetail}</span>
        </div>

        <div className="px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{worstLabel}</span>
            <AlertTriangle className={`h-4 w-4 ${worstDanger ? "text-red-600" : "text-amber-600"}`} />
          </div>
          <strong className={`mt-1 block min-h-7 text-lg ${worstDanger ? "text-red-700" : "text-amber-700"}`}>{worstValue || "\u00A0"}</strong>
          <span className={`block text-[10px] ${worstEmpty ? "text-slate-400" : "text-slate-500"}`}>{worstDetail}</span>
        </div>
      </div>
    </div>
  );
}

function monthLabel(periodKey) {
  const [yearValue, monthValue] = String(periodKey).split("-");
  const monthName = months.find(([value]) => value === monthValue)?.[1] ?? monthValue;
  return `${monthName} ${yearValue}`;
}

function monthAccountLabel(periodKey, accountName) {
  const base = monthLabel(periodKey);
  return accountName ? `${base} · ${accountName}` : base;
}

function SelectField({ label, children }) {
  return <label className="relative block"><span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</span>{children}<ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3.5 w-3.5 text-slate-400" /></label>;
}
