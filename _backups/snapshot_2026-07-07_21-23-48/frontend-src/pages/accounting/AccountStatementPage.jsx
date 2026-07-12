import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CalculatorIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { getAccounts } from "../../services/accountService";
import { getAccredits } from "../../services/accreditService";
import { accountingYears } from "../../utils/accountingPeriods";
import {
  createAccountStatement,
  deleteAccountStatement,
  getAccountStatements,
  updateAccountStatement,
} from "../../services/accountStatementService";

const currency = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const months = [
  ["01", "Gennaio"], ["02", "Febbraio"], ["03", "Marzo"], ["04", "Aprile"],
  ["05", "Maggio"], ["06", "Giugno"], ["07", "Luglio"], ["08", "Agosto"],
  ["09", "Settembre"], ["10", "Ottobre"], ["11", "Novembre"], ["12", "Dicembre"],
];

function previousPeriod(period) {
  if (period === "2024-01") return null;
  const [year, month] = period.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function errorMessage(error, fallback) {
  return error.response?.data?.message ?? fallback;
}

export default function AccountStatementPage() {
  const { accountId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const year = searchParams.get("year") || String(new Date().getFullYear());
  const [account, setAccount] = useState(null);
  const [statements, setStatements] = useState([]);
  const [accredits, setAccredits] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => searchParams.get("month") || (year === String(new Date().getFullYear()) ? String(new Date().getMonth() + 1).padStart(2, "0") : ""));
  const [fields, setFields] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  useEffect(() => {
    Promise.all([getAccounts(), getAccountStatements(), getAccredits()])
      .then(([accounts, statementData, accreditData]) => {
        setAccount(accounts.find((item) => String(item.id) === accountId) ?? null);
        setStatements(statementData);
        setAccredits(accreditData);
      })
      .catch((error) => setMessage({ text: errorMessage(error, "Impossibile caricare il conto."), error: true }))
      .finally(() => setLoading(false));
  }, [accountId]);

  const accountStatements = useMemo(() => statements.filter((item) => String(item.accountId) === accountId), [accountId, statements]);
  const accountAccredits = useMemo(() => accredits.filter((item) => String(item.accountId) === accountId), [accountId, accredits]);
  const yearStatements = useMemo(() => accountStatements.filter((item) => String(item.period).slice(0, 4) === year), [accountStatements, year]);
  const years = useMemo(() => {
    return accountingYears(
      accountStatements.map((item) => item.period),
      accountAccredits.map((item) => item.movementDate),
      [year],
    ).reverse();
  }, [accountAccredits, accountStatements, year]);

  const accreditCountByMonth = useMemo(() => accountAccredits.reduce((result, item) => {
    const date = String(item.movementDate);
    if (date.slice(0, 4) !== year) return result;
    const month = date.slice(5, 7);
    result[month] = (result[month] ?? 0) + 1;
    return result;
  }, {}), [accountAccredits, year]);

  const rows = useMemo(() => months.map(([month, label]) => {
    const period = `${year}-${month}`;
    const statement = yearStatements.find((item) => String(item.period).slice(0, 7) === period) ?? null;
    const previousKey = previousPeriod(period);
    const previous = previousKey ? accountStatements.find((item) => String(item.period).slice(0, 7) === previousKey) : null;
    return { month, label, period, statement, previous };
  }), [accountStatements, year, yearStatements]);

  useEffect(() => {
    if (!loading && selectedMonth) {
      window.requestAnimationFrame(() => document.getElementById(`statement-month-${selectedMonth}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
  }, [loading, selectedMonth, year]);

  const metrics = useMemo(() => {
    const ordered = [...yearStatements].sort((first, second) => String(first.period).localeCompare(String(second.period)));
    const latest = ordered[ordered.length - 1] ?? null;
    const change = ordered.reduce((sum, item) => sum + Number(item.currentBalance) - Number(item.previousBalance), 0);
    return {
      balance: Number(latest?.currentBalance ?? 0),
      change,
      average: ordered.length ? change / ordered.length : 0,
      count: ordered.length,
      ordered,
    };
  }, [yearStatements]);

  const automaticPreviousKey = fields ? previousPeriod(fields.period) : null;
  const automaticPrevious = fields && automaticPreviousKey ? accountStatements.find((item) =>
    item.id !== editing?.id && String(item.period).slice(0, 7) === automaticPreviousKey
  ) : null;
  const previousValue = automaticPrevious ? automaticPrevious.currentBalance : fields?.previousBalance || 0;

  function openRow(row) {
    setEditing(row.statement);
    setFields({
      accountId,
      period: row.period,
      previousBalance: row.statement?.previousBalance ?? row.previous?.currentBalance ?? 0,
      currentBalance: row.statement?.currentBalance ?? "",
      notes: row.statement?.notes ?? "",
    });
    setMessage({ text: "", error: false });
  }

  function chooseMonth(month) {
    setSelectedMonth(month);
    if (!month) return;
    const row = rows.find((item) => item.month === month);
    if (!row) return;
    openRow(row);
    window.requestAnimationFrame(() => document.getElementById(`statement-month-${month}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...fields, previousBalance: previousValue };
      if (editing) await updateAccountStatement(editing.id, payload);
      else await createAccountStatement(payload);
      setStatements(await getAccountStatements());
      setFields(null);
      setEditing(null);
      setMessage({ text: "Saldo mensile salvato correttamente.", error: false });
    } catch (error) {
      setMessage({ text: errorMessage(error, "Impossibile salvare il saldo."), error: true });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setSaving(true);
    try {
      await deleteAccountStatement(deleting.id);
      setStatements(await getAccountStatements());
      setDeleting(null);
      setMessage({ text: "Estratto conto eliminato.", error: false });
    } catch (error) {
      setMessage({ text: errorMessage(error, "Impossibile eliminare l'estratto conto."), error: true });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Caricamento...</p>;
  if (!account) return <div className="rounded-lg border border-slate-200 bg-white p-8"><h1 className="text-xl font-semibold">Conto non trovato</h1><Link to="/accounting/statements" className="mt-4 inline-block text-sm text-amber-700">Torna ai conti</Link></div>;

  const color = account.color || "#64748b";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-2">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <ChartBarIcon className="h-6 w-6 shrink-0 text-amber-600" />
          <h1 className="text-2xl font-semibold text-slate-900">ESTRATTI CONTO {account.name.toUpperCase()} ANNO {year}</h1>
        </div>
        <p className="mt-2 text-slate-500">Gestisci i saldi mensili, visualizza le variazioni e i totali annuali.</p>
      </div>
      <div className="flex items-center justify-end gap-2">
        <SelectField label="Anno">
          <select value={year} onChange={(event) => { const nextYear = event.target.value; setSearchParams({ year: nextYear }); setFields(null); setSelectedMonth(nextYear === String(new Date().getFullYear()) ? String(new Date().getMonth() + 1).padStart(2, "0") : ""); }} className="h-9 w-24 appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-8 text-xs outline-none focus:border-amber-500">{years.map((value) => <option key={value}>{value}</option>)}</select>
        </SelectField>
        <SelectField label="Mese">
          <select value={selectedMonth} onChange={(event) => chooseMonth(event.target.value)} className="h-9 w-48 appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-8 text-xs outline-none focus:border-amber-500">
            <option value="">Scegli il mese</option>
              {months.map(([value, label]) => <option key={value} value={value}>{label}{accreditCountByMonth[value] ? ` · ${accreditCountByMonth[value]} accrediti` : ""}</option>)}
            </select>
          </SelectField>
      </div>
      </div>
      </div>

      <div className="p-3">

      {message.text && <p className={`rounded-md px-4 py-3 text-sm ${message.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{message.text}</p>}

      {fields && (
        <form onSubmit={save} className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">{editing ? "Modifica" : "Inserisci"} {months.find(([month]) => fields.period.endsWith(month))?.[1]} {year}</h2><button type="button" onClick={() => setFields(null)} className="text-xs text-slate-500 hover:text-slate-800">Chiudi</button></div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Saldo mese precedente"><div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm tabular-nums text-slate-500">{currency.format(Number(previousValue))}</div></FormField>
            <FormField label="Saldo mese corrente *"><input type="number" step="0.01" required value={fields.currentBalance} onChange={(event) => setFields((current) => ({ ...current, currentBalance: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500" /></FormField>
            <FormField label="Note"><input value={fields.notes} onChange={(event) => setFields((current) => ({ ...current, notes: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500" /></FormField>
          </div>
          {automaticPrevious && <p className="mt-2 text-xs text-slate-400">Saldo precedente compilato automaticamente dal mese precedente.</p>}
          <div className="mt-4 flex justify-end"><button type="submit" disabled={saving} className="h-9 rounded-md bg-amber-500 px-5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60">{saving ? "Salvataggio..." : "Salva mese"}</button></div>
        </form>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label={`Saldo ${year}`} value={currency.format(metrics.balance)} icon={BanknotesIcon} danger={metrics.balance < 0} />
        <Stat label={`Variazione ${year}`} value={`${metrics.change >= 0 ? "+" : ""}${currency.format(metrics.change)}`} icon={metrics.change < 0 ? ExclamationTriangleIcon : ArrowTrendingUpIcon} danger={metrics.change < 0} />
        <Stat label="Variazione media" value={`${metrics.average >= 0 ? "+" : ""}${currency.format(metrics.average)}`} icon={CalculatorIcon} danger={metrics.average < 0} />
        <Stat label="Mesi compilati" value={`${metrics.count}/12`} icon={ChartBarIcon} />
      </div>

      <TrendChart data={metrics.ordered} color={color} />

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-[110px_1fr_1fr_1fr_100px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><span>Mese</span><span className="text-right">Precedente</span><span className="text-right">Corrente</span><span className="text-right">Variazione</span><span /></div>
        <div className="divide-y divide-slate-100">
          {rows.map((row) => {
            const statement = row.statement;
            const previous = statement?.previousBalance ?? row.previous?.currentBalance;
            const change = statement ? Number(statement.currentBalance) - Number(statement.previousBalance) : null;
            return (
              <div id={`statement-month-${row.month}`} key={row.month} className={`grid grid-cols-[110px_1fr_1fr_1fr_100px] items-center gap-4 px-5 py-2.5 text-[13px] transition-colors ${selectedMonth === row.month ? "bg-amber-50" : ""}`}>
                <span className={`font-medium ${statement ? "text-slate-800" : "text-slate-400"}`}>{row.label}</span>
                <span className="text-right tabular-nums text-slate-500">{previous === undefined ? "—" : currency.format(Number(previous))}</span>
                <strong className={`text-right tabular-nums ${statement ? Number(statement.currentBalance) < 0 ? "text-red-600" : "text-slate-900" : "text-slate-300"}`}>{statement ? currency.format(Number(statement.currentBalance)) : "—"}</strong>
                <strong className={`text-right tabular-nums ${change === null ? "text-slate-300" : change < 0 ? "text-red-600" : "text-emerald-600"}`}>{change === null ? "—" : `${change >= 0 ? "+" : ""}${currency.format(change)}`}</strong>
                <div className="flex justify-end gap-1">{statement ? <><button type="button" onClick={() => openRow(row)} aria-label={`Modifica ${row.label}`} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-amber-50 hover:text-amber-700"><PencilSquareIcon className="h-4 w-4" /></button><button type="button" onClick={() => setDeleting(statement)} aria-label={`Elimina ${row.label}`} className="flex h-7 w-7 items-center justify-center rounded-md text-red-500 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button></> : <button type="button" onClick={() => openRow(row)} className="flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-[11px] text-slate-600 hover:border-amber-300 hover:bg-amber-50"><PlusIcon className="h-3.5 w-3.5" />Inserisci</button>}</div>
              </div>
            );
          })}
        </div>
      </div>

      {deleting && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-6"><div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8"><h2 className="text-xl font-semibold text-slate-900">Eliminare il mese?</h2><p className="mt-3 text-sm text-slate-600">La registrazione verrà eliminata e il mese successivo verrà riallineato.</p><div className="mt-8 flex justify-end gap-3"><button type="button" onClick={() => setDeleting(null)} className="rounded-md border border-slate-300 px-5 py-3">Annulla</button><button type="button" onClick={confirmDelete} disabled={saving} className="rounded-md bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-60">Elimina</button></div></div></div>}
    </div>
    </div>
  );
}

function FormField({ label, children }) {
  return <label className="text-xs font-medium text-slate-600">{label}<span className="mt-1 block">{children}</span></label>;
}

function SelectField({ label, children }) {
  return <label className="relative block"><span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</span>{children}<ChevronDownIcon className="pointer-events-none absolute bottom-2.5 right-2 h-3.5 w-3.5 text-slate-400" /></label>;
}

function Stat({ label, value, icon: Icon, danger = false }) {
  return <div role={danger ? "alert" : undefined} className={`rounded-lg border px-4 py-3 ${danger ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`}><div className="flex justify-between"><span className={`text-[10px] font-medium uppercase tracking-wide ${danger ? "text-red-600" : "text-slate-400"}`}>{label}</span><Icon className={`h-4 w-4 ${danger ? "text-red-600" : "text-amber-600"}`} /></div><strong className={`mt-1.5 block text-xl ${danger ? "text-red-700" : "text-slate-900"}`}>{value}</strong></div>;
}

function TrendChart({ data, color }) {
  if (!data.length) return null;
  const values = data.map((item) => Number(item.currentBalance));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = data.map((item, index) => `${data.length === 1 ? 50 : (index / (data.length - 1)) * 100},${42 - ((Number(item.currentBalance) - min) / range) * 32}`).join(" ");
  return <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3"><div className="flex justify-between"><h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Andamento annuale</h2><span className="text-[10px] text-slate-400">{data.length} mesi</span></div><svg viewBox="0 0 100 46" preserveAspectRatio="none" className="mt-1 h-20 w-full"><line x1="0" y1="42" x2="100" y2="42" stroke="#e2e8f0" strokeWidth="0.5" /><polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg></div>;
}
