import {
  BanknotesIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getAccounts } from "../../services/accountService";
import { getAccountStatements } from "../../services/accountStatementService";
import { getAccredits } from "../../services/accreditService";
import { accountingYears } from "../../utils/accountingPeriods";

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

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3"><DocumentTextIcon className="h-8 w-8 text-amber-500" /><h1 className="text-2xl font-semibold text-slate-900">Gestisci estratti conto</h1></div>
          <p className="mt-2 text-slate-500">Scegli un conto per gestire i dodici mesi dell'anno.</p>
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

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Stat label={`Patrimonio ${year}`} value={currency.format(totalAssets)} icon={BanknotesIcon} danger={totalAssets < 0} />
        <Stat label={`Variazione ${year}`} value={`${totalChange >= 0 ? "+" : ""}${currency.format(totalChange)}`} icon={totalChange < 0 ? ExclamationTriangleIcon : ChartBarIcon} danger={totalChange < 0} />
        <Stat label="Mensilità registrate" value={String(completedMonths)} icon={DocumentTextIcon} />
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
                  <span className="flex items-center gap-3"><strong className={`text-xs tabular-nums ${change < 0 ? "text-red-600" : "text-emerald-600"}`}>{rows.length ? `${change >= 0 ? "+" : ""}${currency.format(change)}` : ""}</strong><ChevronRightIcon className="h-4 w-4 text-slate-400" /></span>
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

function Stat({ label, value, icon: Icon, danger = false }) {
  return <div role={danger ? "alert" : undefined} className={`rounded-lg border px-4 py-3 ${danger ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`}><div className="flex justify-between"><span className={`text-[10px] font-medium uppercase tracking-wide ${danger ? "text-red-600" : "text-slate-400"}`}>{label}</span><Icon className={`h-4 w-4 ${danger ? "text-red-600" : "text-amber-600"}`} /></div><strong className={`mt-1.5 block text-xl ${danger ? "text-red-700" : "text-slate-900"}`}>{value}</strong></div>;
}

function SelectField({ label, children }) {
  return <label className="relative block"><span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</span>{children}<ChevronDownIcon className="pointer-events-none absolute bottom-2.5 right-2 h-3.5 w-3.5 text-slate-400" /></label>;
}
