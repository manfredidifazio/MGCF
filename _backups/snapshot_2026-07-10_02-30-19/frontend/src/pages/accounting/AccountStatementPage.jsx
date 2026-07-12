import {
  TrendingUp,
  Banknote,
  Calculator,
  BarChart,
  AlertTriangle,
  SquarePen,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { scrollToElement } from "../../utils/scrollToElement";
import { STATEMENT_LABELS } from "../../utils/statementLabels";
import { formatCurrencyAmount, hasMeaningfulAmount } from "../../utils/statementMetrics";

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
  const [searchParams] = useSearchParams();
  const year = searchParams.get("year") || String(new Date().getFullYear());
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState(null);
  const [statements, setStatements] = useState([]);
  const [accredits, setAccredits] = useState([]);
  const [fields, setFields] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });
  const [stickyEdit, setStickyEdit] = useState(null);
  const [stickySaving, setStickySaving] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    Promise.all([getAccounts(), getAccountStatements(), getAccredits()])
      .then(([accounts, statementData, accreditData]) => {
        setAccounts(accounts);
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

  const rows = useMemo(() => months.map(([month, label]) => {
    const period = `${year}-${month}`;
    const statement = yearStatements.find((item) => String(item.period).slice(0, 7) === period) ?? null;
    const previousKey = previousPeriod(period);
    const previous = previousKey ? accountStatements.find((item) => String(item.period).slice(0, 7) === previousKey) : null;
    return { month, label, period, statement, previous };
  }), [accountStatements, year, yearStatements]);

  const currentMonthRow = useMemo(() => {
    if (year !== String(new Date().getFullYear())) return null;
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentLabel = months.find(([m]) => m === currentMonth)?.[1];
    const period = `${year}-${currentMonth}`;
    const statement = yearStatements.find((item) => String(item.period).slice(0, 7) === period) ?? null;
    if (!statement) return null;
    return { month: currentMonth, label: currentLabel, period, statement };
  }, [year, yearStatements]);

  useEffect(() => {
    if (fields) scrollToElement(formRef.current);
  }, [fields]);

  useEffect(() => {
    if (!message.text) return undefined;

    const timeoutId = window.setTimeout(() => {
      setMessage({ text: "", error: false });
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [message.text]);

  const metrics = useMemo(() => {
    const ordered = [...yearStatements].sort((first, second) => String(first.period).localeCompare(String(second.period)));
    const latestOverall = [...accountStatements].sort((first, second) => String(second.period).localeCompare(String(first.period)))[0] ?? null;
    const change = ordered.reduce((sum, item) => sum + Number(item.currentBalance) - Number(item.previousBalance), 0);
    const monthlyCurrents = ordered.map((item) => ({
      period: String(item.period).slice(0, 7),
      value: Number(item.currentBalance),
    }));
    const monthlyChanges = ordered.map((item) => ({
      period: String(item.period).slice(0, 7),
      value: Number(item.currentBalance) - Number(item.previousBalance),
    }));
    const bestCurrent = monthlyCurrents.length
      ? monthlyCurrents.reduce((best, item) => (item.value > best.value ? item : best), monthlyCurrents[0])
      : null;
    const worstCurrent = monthlyCurrents.length
      ? monthlyCurrents.reduce((worst, item) => (item.value < worst.value ? item : worst), monthlyCurrents[0])
      : null;
    const bestRevenue = monthlyChanges.length
      ? monthlyChanges.reduce((best, item) => (item.value > best.value ? item : best), monthlyChanges[0])
      : null;
    const worstRevenue = monthlyChanges.length
      ? monthlyChanges.reduce((worst, item) => (item.value < worst.value ? item : worst), monthlyChanges[0])
      : null;

    const globalLatestBalance = accounts
      .filter((item) => item.active)
      .map((currentAccount) => {
        const latestByAccount = statements
          .filter((item) => String(item.accountId) === String(currentAccount.id))
          .sort((first, second) => String(second.period).localeCompare(String(first.period)))[0];
        return Number(latestByAccount?.currentBalance ?? 0);
      })
      .reduce((sum, value) => sum + value, 0);

    return {
      balance: Number(latestOverall?.currentBalance ?? 0),
      change,
      average: ordered.length ? change / ordered.length : 0,
      count: ordered.length,
      ordered,
      bestCurrent,
      worstCurrent,
      bestRevenue,
      worstRevenue,
      globalLatestBalance,
    };
  }, [accounts, accountStatements, statements, yearStatements]);

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

  async function saveStickyEdit() {
    setStickySaving(true);
    try {
      await updateAccountStatement(currentMonthRow.statement.id, {
        ...currentMonthRow.statement,
        currentBalance: stickyEdit,
      });
      setStatements(await getAccountStatements());
      setStickyEdit(null);
      setMessage({ text: "Estratto conto aggiornato.", error: false });
    } catch (error) {
      setMessage({ text: errorMessage(error, "Impossibile salvare."), error: true });
    } finally {
      setStickySaving(false);
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
  const hasYearData = metrics.count > 0;
  const hasRevenue = hasMeaningfulAmount(metrics.change);
  const hasAverage = hasMeaningfulAmount(metrics.average);
  const hasBalance = hasMeaningfulAmount(metrics.balance);
  const hasGlobalBalance = hasMeaningfulAmount(metrics.globalLatestBalance);
  const hasBestCurrent = metrics.bestCurrent && hasMeaningfulAmount(metrics.bestCurrent.value);
  const hasWorstCurrent = metrics.worstCurrent && hasMeaningfulAmount(metrics.worstCurrent.value);
  const hasBestRevenue = metrics.bestRevenue && hasMeaningfulAmount(metrics.bestRevenue.value);
  const hasWorstRevenue = metrics.worstRevenue && hasMeaningfulAmount(metrics.worstRevenue.value);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 border-b border-indigo-700 px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 shrink-0 text-white" />
              <h1 className="text-xl font-semibold text-white">ESTRATTI CONTO {account.name.toUpperCase()} ANNO {year}</h1>
            </div>
            <p className="mt-1 text-sm text-white/80">Gestisci i saldi mensili, visualizza le variazioni e i totali annuali.</p>
          </div>

          {currentMonthRow && (
            <div className="relative lg:ml-auto">
              <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-100 px-3 py-2 text-slate-900 shadow-sm backdrop-blur-sm">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600">MODIFICA RAPIDA {currentMonthRow.label.toUpperCase()} {year}</p>
                  <p className="text-sm font-semibold leading-tight text-red-600">{currency.format(Number(currentMonthRow.statement.currentBalance))}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setStickyEdit((current) => current ?? String(currentMonthRow.statement.currentBalance))}
                  className="shrink-0 rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600"
                >
                  <SquarePen className="h-4 w-4" />
                </button>
              </div>

              {stickyEdit !== null && (
                <div className="absolute right-0 top-full z-20 mt-2 w-[340px] rounded-lg border border-orange-200 bg-orange-100/95 p-3 text-slate-900 shadow-lg backdrop-blur-sm">
                  <div className="space-y-2">
                    <input
                      autoFocus
                      type="number"
                      step="0.01"
                      value={stickyEdit}
                      onChange={(e) => setStickyEdit(e.target.value)}
                      className="h-8 w-full rounded-md border border-slate-300 bg-white/95 px-3 text-sm text-slate-900 outline-none focus:border-orange-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveStickyEdit}
                        disabled={stickySaving}
                        className="flex-1 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                      >
                        {stickySaving ? "Salvataggio..." : "Salva"}
                      </button>
                      <button
                        onClick={() => setStickyEdit(null)}
                        className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-3 pb-3 pt-0">

      {message.text && <p className={`rounded-md px-4 py-3 text-sm ${message.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{message.text}</p>}

      {fields && (
        <form ref={formRef} onSubmit={save} className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">{editing ? "Modifica" : "Inserisci"} {months.find(([month]) => fields.period.endsWith(month))?.[1]} {year}</h2><button type="button" onClick={() => setFields(null)} className="text-xs text-slate-500 hover:text-slate-800">Chiudi</button></div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label={previousBalanceLabel(fields.period)}>
              {fields.period === "2024-01" ? (
                <input
                  type="number"
                  step="0.01"
                  required
                  value={fields.previousBalance}
                  onChange={(event) => setFields((current) => ({ ...current, previousBalance: event.target.value }))}
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500"
                />
              ) : (
                <div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm tabular-nums text-slate-500">{currency.format(Number(previousValue))}</div>
              )}
            </FormField>
            <FormField label="Saldo mese corrente *"><input type="number" step="0.01" required value={fields.currentBalance} onChange={(event) => setFields((current) => ({ ...current, currentBalance: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500" /></FormField>
            <FormField label="Note"><input value={fields.notes} onChange={(event) => setFields((current) => ({ ...current, notes: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500" /></FormField>
          </div>
          {automaticPrevious && <p className="mt-2 text-xs text-slate-400">Saldo precedente compilato automaticamente dal mese precedente.</p>}
          <div className="mt-4 flex justify-end"><button type="submit" disabled={saving} className="h-9 rounded-md bg-amber-500 px-5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60">{saving ? "Salvataggio..." : "Salva mese"}</button></div>
        </form>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          label={`${STATEMENT_LABELS.revenue} ${year} ${account.name}`}
          value={formatCurrencyAmount(metrics.change, currency, { signed: true })}
          icon={metrics.change < 0 ? AlertTriangle : TrendingUp}
          tone={hasRevenue ? "revenue" : "default"}
          danger={hasRevenue && metrics.change < 0}
        />
        <Stat
          label={`${STATEMENT_LABELS.averageRevenue} ${year} ${account.name}`}
          value={formatCurrencyAmount(metrics.average, currency, { signed: true })}
          icon={Calculator}
          tone={hasAverage ? "average" : "default"}
          danger={hasAverage && metrics.average < 0}
        />
        <Stat
          label={`Saldo ${account.name}`}
          value={formatCurrencyAmount(metrics.balance, currency)}
          icon={Banknote}
          tone={hasBalance ? "accountBalance" : "default"}
          danger={hasBalance && metrics.balance < 0}
        />
        <Stat
          label="Saldo generale conti"
          value={formatCurrencyAmount(metrics.globalLatestBalance, currency)}
          icon={BarChart}
          tone={hasGlobalBalance ? "globalBalance" : "default"}
          danger={hasGlobalBalance && metrics.globalLatestBalance < 0}
        />
      </div>

      <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
        <BestWorstStat
          bestLabel="Miglior estratto conto"
          bestValue={metrics.bestCurrent ? formatCurrencyAmount(metrics.bestCurrent.value, currency) : ""}
          bestDetail={hasBestCurrent ? monthLabel(metrics.bestCurrent.period) : "Nessun mese compilato"}
          bestDanger={hasBestCurrent ? metrics.bestCurrent.value < 0 : false}
          worstLabel="Peggior estratto conto"
          worstValue={metrics.worstCurrent ? formatCurrencyAmount(metrics.worstCurrent.value, currency) : ""}
          worstDetail={hasWorstCurrent ? monthLabel(metrics.worstCurrent.period) : "Nessun mese compilato"}
          worstDanger={hasWorstCurrent && metrics.worstCurrent.value < 0}
        />
        <BestWorstStat
          bestLabel="Migliore ricavo"
          bestValue={metrics.bestRevenue ? formatCurrencyAmount(metrics.bestRevenue.value, currency, { signed: true }) : ""}
          bestDetail={hasBestRevenue ? monthLabel(metrics.bestRevenue.period) : "Nessun mese compilato"}
          bestDanger={hasBestRevenue ? metrics.bestRevenue.value < 0 : false}
          worstLabel="Peggiore ricavo"
          worstValue={metrics.worstRevenue ? formatCurrencyAmount(metrics.worstRevenue.value, currency, { signed: true }) : ""}
          worstDetail={hasWorstRevenue ? monthLabel(metrics.worstRevenue.period) : "Nessun mese compilato"}
          worstDanger={hasWorstRevenue && metrics.worstRevenue.value < 0}
        />
      </div>

      <TrendChart rows={rows} color={color} />

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-[110px_1fr_1fr_1fr_100px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><span>Mese</span><span className="text-right">Estratto Conto Mese Precedente</span><span className="text-right">Estratto Conto Mese Corrente</span><span className="text-right">Ricavo del Mese</span><span /></div>
        <div className="divide-y divide-slate-100">
          {rows.map((row) => {
            const statement = row.statement;
            const previous = statement?.previousBalance ?? row.previous?.currentBalance;
            const change = statement ? Number(statement.currentBalance) - Number(statement.previousBalance) : null;
            return (
              <div id={`statement-month-${row.month}`} key={row.month} className="grid grid-cols-[110px_1fr_1fr_1fr_100px] items-center gap-4 px-5 py-2.5 text-[13px] transition-colors">
                <span className={`font-medium ${statement ? "text-slate-800" : "text-slate-400"}`}>{row.label}</span>
                <span className="text-right tabular-nums text-slate-500">{previous === undefined ? "—" : currency.format(Number(previous))}</span>
                <strong className={`text-right tabular-nums ${statement ? Number(statement.currentBalance) < 0 ? "text-red-600" : "text-slate-900" : "text-slate-300"}`}>{statement ? currency.format(Number(statement.currentBalance)) : "—"}</strong>
                <strong className={`text-right tabular-nums ${change === null ? "text-slate-300" : change < 0 ? "text-red-600" : "text-emerald-600"}`}>{change === null ? "—" : `${change >= 0 ? "+" : ""}${currency.format(change)}`}</strong>
                <div className="flex justify-end gap-1">{statement ? <><button type="button" onClick={() => openRow(row)} aria-label={`Modifica ${row.label}`} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-amber-50 hover:text-amber-700"><SquarePen className="h-4 w-4" /></button><button type="button" onClick={() => setDeleting(statement)} aria-label={`Elimina ${row.label}`} className="flex h-7 w-7 items-center justify-center rounded-md text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></> : <button type="button" onClick={() => openRow(row)} className="flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-[11px] text-slate-600 hover:border-amber-300 hover:bg-amber-50"><Plus className="h-3.5 w-3.5" />Inserisci</button>}</div>
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

function previousBalanceLabel(period) {
  return period === "2024-01" ? "Saldo iniziale 2024" : "Saldo mese precedente";
}

function monthLabel(periodKey) {
  const [yearValue, monthValue] = String(periodKey).split("-");
  const monthName = months.find(([value]) => value === monthValue)?.[1] ?? monthValue;
  return `${monthName} ${yearValue}`;
}

function Stat({ label, value, icon: Icon, danger = false, detail, tone = "default" }) {
  const toneClasses = {
    default: "border-slate-200 bg-white text-slate-900",
    revenue: "border-emerald-500 bg-[#15d4a3] text-white",
    average: "border-amber-500 bg-[#ff9f0a] text-white",
    accountBalance: "border-indigo-500 bg-[#6c73ff] text-white",
    globalBalance: "border-purple-500 bg-[#af4cff] text-white",
    best: "border-lime-500 bg-[#7be400] text-white",
    worst: "border-rose-500 bg-[#ff5c72] text-white",
  };

  const color = danger ? "border-red-500 bg-red-500 text-white" : (toneClasses[tone] ?? toneClasses.default);
  const labelColor = danger ? "text-white/80" : (tone !== "default" ? "text-white/80" : "text-slate-500");
  const iconColor = danger ? "text-white" : (tone !== "default" ? "text-white" : "text-slate-600");
  const detailColor = danger ? "text-white/70" : (tone !== "default" ? "text-white/70" : "text-slate-500");

  return (
    <div role={danger ? "alert" : undefined} className={`rounded-lg border px-4 py-3 ${color}`}>
      <div className="flex justify-between">
        <span className={`text-[10px] font-medium uppercase tracking-wide ${labelColor}`}>{label}</span>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <strong className={`mt-1.5 block min-h-8 text-xl ${tone !== "default" ? "text-white" : ""}`}>{value || "\u00A0"}</strong>
      {detail && <span className={`mt-0.5 block text-[10px] ${detailColor}`}>{detail}</span>}
    </div>
  );
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
            <TrendingUp className={`h-4 w-4 ${bestDanger ? "text-red-600" : "text-green-500"}`} />
          </div>
          <strong className={`mt-1 block min-h-7 text-lg ${bestDanger ? "text-red-600" : "text-green-500"}`}>{bestValue || "\u00A0"}</strong>
          <span className={`block text-[10px] ${bestEmpty ? "text-slate-400" : "text-slate-500"}`}>{bestDetail}</span>
        </div>

        <div className="px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{worstLabel}</span>
            <AlertTriangle className={`h-4 w-4 ${worstDanger ? "text-red-600" : "text-red-500"}`} />
          </div>
          <strong className={`mt-1 block min-h-7 text-lg ${worstDanger ? "text-red-600" : "text-red-500"}`}>{worstValue || "\u00A0"}</strong>
          <span className={`block text-[10px] ${worstEmpty ? "text-slate-400" : "text-slate-500"}`}>{worstDetail}</span>
        </div>
      </div>
    </div>
  );
}

function TrendChart({ rows, color }) {
  const series = rows
    .filter((row) => row.statement)
    .map((row) => ({
      month: monthShortLabel(row.month),
      current: Number(row.statement.currentBalance),
      revenue: Number(row.statement.currentBalance) - Number(row.statement.previousBalance),
    }));

  if (!series.length) return null;

  const monthsShort = series.map((item) => item.month);
  const currentValues = series.map((item) => item.current);
  const revenueValues = series.map((item) => item.revenue);

  return (
    <div className="mt-2 grid grid-cols-1 gap-3 xl:grid-cols-2">
      <TrendPanel
        title="Andamento saldo conto"
        monthsCount={series.length}
        values={currentValues}
        monthLabels={monthsShort}
        lineColor={color}
        gradientId="mgcfTrendCurrent"
      />
      <TrendPanel
        title="Andamento ricavo mensile"
        monthsCount={series.length}
        values={revenueValues}
        monthLabels={monthsShort}
        lineColor="#65a30d"
        gradientId="mgcfTrendRevenue"
        showZeroLine
        signedAxis
      />
    </div>
  );
}

function TrendPanel({
  title,
  monthsCount,
  values,
  monthLabels,
  lineColor,
  gradientId,
  showZeroLine = false,
  signedAxis = false,
}) {
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
    <div className="bg-white">
      <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
        <span className="text-[10px] text-slate-400">{monthsCount} mesi</span>
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

          <div className="mt-1 grid text-[10px] font-medium uppercase tracking-wide text-slate-500" style={{ gridTemplateColumns: `repeat(${monthLabels.length}, minmax(0, 1fr))` }}>
            {monthLabels.map((month, index) => (
              <span key={`${month}-${index}`} className="text-center">{month}</span>
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
    </div>
  );
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

function monthShortLabel(monthNumber) {
  const monthName = months.find(([value]) => value === monthNumber)?.[1] ?? monthNumber;
  return monthName.slice(0, 3).toUpperCase();
}
