import {
  ArrowLeft,
  TrendingUp,
  Banknote,
  Calculator,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  SquarePen,
  Plus,
  Trash2,
  BarChart,
  FileDown,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Amount from "../../components/ui/Amount";
import { getAccounts } from "../../services/accountService";
import { createAccredit, deleteAccredit, getAccredits, updateAccredit } from "../../services/accreditService";
import { getManagedItems } from "../../services/managedItemService";
import { accountingYears } from "../../utils/accountingPeriods";

const currency = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("it-IT");
const months = [
  ["01", "Gennaio"], ["02", "Febbraio"], ["03", "Marzo"], ["04", "Aprile"],
  ["05", "Maggio"], ["06", "Giugno"], ["07", "Luglio"], ["08", "Agosto"],
  ["09", "Settembre"], ["10", "Ottobre"], ["11", "Novembre"], ["12", "Dicembre"],
];

function localDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function emptyForm() {
  return { movementDate: localDate(), amount: "", accountId: "", causeId: "", notes: "" };
}

function currentMonthFilters() {
  const today = localDate();
  return { accountId: "", month: today.slice(5, 7), year: today.slice(0, 4) };
}

function errorMessage(error, fallback) {
  return error.response?.data?.message ?? fallback;
}

function monthKey(date) {
  return String(date).slice(0, 7);
}

function shiftedMonthKey(year, month, offset) {
  const date = new Date(Number(year), Number(month) - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthKeyLabel(key) {
  const [year, month] = key.split("-");
  const name = months.find(([value]) => value === month)?.[1] ?? month;
  return `${name.toLocaleLowerCase("it")} ${year}`;
}

function periodStatisticLabels(filters) {
  const monthName = months.find(([value]) => value === filters.month)?.[1].toLocaleLowerCase("it");

  if (monthName && filters.year) {
    const period = `${monthName} ${filters.year}`;
    return {
      amount: `Importo di ${period}`,
      count: `Accrediti di ${period}`,
      average: `Media di ${period}`,
      variation: `Variazione di ${period}`,
    };
  }

  if (filters.year) {
    return {
      amount: `Importo del ${filters.year}`,
      count: `Accrediti del ${filters.year}`,
      average: `Media del ${filters.year}`,
      variation: `Variazione nel ${filters.year}`,
    };
  }

  if (monthName) {
    return {
      amount: `Importo di ${monthName}`,
      count: `Accrediti di ${monthName}`,
      average: `Media di ${monthName}`,
      variation: `Variazione di ${monthName}`,
    };
  }

  return {
    amount: "Importo complessivo",
    count: "Accrediti complessivi",
    average: "Media complessiva",
    variation: "Variazione mensile",
  };
}

export default function AccreditsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accredits, setAccredits] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [causes, setCauses] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [fields, setFields] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });
  const [listFilters, setListFilters] = useState({ dateFrom: "", dateTo: "", causeId: "", sortBy: "date" });
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);

  const globalFilters = useMemo(() => {
    const defaults = currentMonthFilters();
    return {
      accountId: searchParams.has("account") ? searchParams.get("account") : defaults.accountId,
      month: searchParams.has("month") ? (searchParams.get("month") || "") : defaults.month,
      year: searchParams.get("year") || defaults.year,
    };
  }, [searchParams]);

  const selectedMonthLabel = useMemo(
    () => months.find(([value]) => value === globalFilters.month)?.[1] ?? "Tutti i mesi",
    [globalFilters.month],
  );

  useEffect(() => {
    if (!monthMenuOpen) return undefined;

    function handleDocumentClick(event) {
      if (!event.target.closest("[data-accredits-month-menu]")) {
        setMonthMenuOpen(false);
      }
    }

    function handleEsc(event) {
      if (event.key === "Escape") {
        setMonthMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [monthMenuOpen]);

  useEffect(() => {
    Promise.all([getAccredits(), getAccounts(), getManagedItems("cause")])
      .then(([accreditData, accountData, causeData]) => {
        setAccredits(accreditData);
        setAccounts(accountData);
        setCauses(causeData);
      })
      .catch((error) => setMessage({ text: errorMessage(error, "Impossibile caricare i dati."), error: true }))
      .finally(() => setLoading(false));
  }, []);

  const scopedAccredits = useMemo(() => accredits.filter((item) => {
    const date = String(item.movementDate);
    if (globalFilters.accountId && String(item.accountId) !== globalFilters.accountId) return false;
    if (globalFilters.month && date.slice(5, 7) !== globalFilters.month) return false;
    if (globalFilters.year && date.slice(0, 4) !== globalFilters.year) return false;
    return true;
  }), [accredits, globalFilters]);

  const visibleAccredits = useMemo(() => scopedAccredits.filter((item) => {
    const date = String(item.movementDate).slice(0, 10);
    if (listFilters.dateFrom && date < listFilters.dateFrom) return false;
    if (listFilters.dateTo && date > listFilters.dateTo) return false;
    if (listFilters.causeId && String(item.causeId) !== listFilters.causeId) return false;
    return true;
  }).sort((first, second) => {
    if (listFilters.sortBy === "cause") {
      return String(first.causeName ?? "").localeCompare(String(second.causeName ?? ""), "it") || String(second.movementDate).localeCompare(String(first.movementDate)) || second.id - first.id;
    }
    return String(second.movementDate).localeCompare(String(first.movementDate)) || second.id - first.id;
  }), [listFilters, scopedAccredits]);

  const metrics = useMemo(() => {
    const total = scopedAccredits.reduce((sum, item) => sum + Number(item.amount), 0);
    const today = localDate();
    const comparisonYear = globalFilters.year || today.slice(0, 4);
    const comparisonMonth = globalFilters.month || today.slice(5, 7);
    const currentKey = `${comparisonYear}-${comparisonMonth}`;
    const previousKey = shiftedMonthKey(comparisonYear, comparisonMonth, -1);
    const comparisonPool = globalFilters.accountId
      ? accredits.filter((item) => String(item.accountId) === globalFilters.accountId)
      : accredits;
    const currentMonth = comparisonPool.filter((item) => monthKey(item.movementDate) === currentKey).reduce((sum, item) => sum + Number(item.amount), 0);
    const previousMonth = comparisonPool.filter((item) => monthKey(item.movementDate) === previousKey).reduce((sum, item) => sum + Number(item.amount), 0);
    
    // Calcoli per anno intero
    const yearAccredits = globalFilters.accountId
      ? accredits.filter((item) => String(item.accountId) === globalFilters.accountId && String(item.movementDate).slice(0, 4) === comparisonYear)
      : accredits.filter((item) => String(item.movementDate).slice(0, 4) === comparisonYear);
    const yearCount = yearAccredits.length;
    const yearTotal = yearAccredits.reduce((sum, item) => sum + Number(item.amount), 0);
    
    const byAccount = Object.values(scopedAccredits.reduce((result, item) => {
      const key = item.accountId;
      result[key] ??= { accountId: key, accountName: item.accountName, accountColor: item.accountColor, count: 0, total: 0 };
      result[key].count += 1;
      result[key].total += Number(item.amount);
      return result;
    }, {})).sort((first, second) => second.total - first.total);
    return {
      total,
      count: scopedAccredits.length,
      average: scopedAccredits.length ? total / scopedAccredits.length : 0,
      yearCount,
      yearTotal,
      currentMonth,
      previousMonth,
      currentPeriodLabel: monthKeyLabel(currentKey),
      previousPeriodLabel: monthKeyLabel(previousKey),
      difference: currentMonth - previousMonth,
      percentage: previousMonth ? ((currentMonth - previousMonth) / previousMonth) * 100 : null,
      byAccount,
    };
  }, [accredits, globalFilters, scopedAccredits]);

  function openNew() {
    const today = localDate();
    const selectedYear = globalFilters.year || today.slice(0, 4);
    const selectedMonth = globalFilters.month || today.slice(5, 7);
    const selectedDay = selectedYear === today.slice(0, 4) && selectedMonth === today.slice(5, 7) ? today.slice(8, 10) : "01";
    setEditing(null);
    setFields({ ...emptyForm(), accountId: globalFilters.accountId, movementDate: `${selectedYear}-${selectedMonth}-${selectedDay}` });
    setFormOpen(true);
    setMessage({ text: "", error: false });
  }

  function openEdit(item) {
    setEditing(item);
    setFields({ movementDate: String(item.movementDate).slice(0, 10), amount: item.amount, accountId: String(item.accountId), causeId: item.causeId ? String(item.causeId) : "", notes: item.notes ?? "" });
    setFormOpen(true);
    setMessage({ text: "", error: false });
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function applyMonthFilter(value) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("month", value);
    setSearchParams(newParams);
    setMonthMenuOpen(false);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = editing ? await updateAccredit(editing.id, fields) : await createAccredit(fields);
      setAccredits((current) => {
        const next = editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
        return next.sort((first, second) => String(second.movementDate).localeCompare(String(first.movementDate)) || second.id - first.id);
      });
      closeForm();
      setMessage({ text: "Accredito salvato correttamente.", error: false });
    } catch (error) {
      setMessage({ text: errorMessage(error, "Impossibile salvare l'accredito."), error: true });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setSaving(true);
    try {
      await deleteAccredit(deleting.id);
      setAccredits((current) => current.filter((item) => item.id !== deleting.id));
      setMessage({ text: "Accredito eliminato.", error: false });
    } catch (error) {
      setMessage({ text: errorMessage(error, "Impossibile eliminare l'accredito."), error: true });
    } finally {
      setDeleting(null);
      setSaving(false);
    }
  }

  const activeCauses = causes.filter((cause) => cause.active || String(cause.id) === fields.causeId);
  const selectedAccount = accounts.find((account) => String(account.id) === globalFilters.accountId);
  const statisticLabels = periodStatisticLabels(globalFilters);

  if (!globalFilters.accountId) {
    return <AccreditsOverview accounts={accounts} accredits={accredits} causes={causes} loading={loading} message={message} />;
  }

  if (!searchParams.has("year")) {
    return <AccountAccreditsOverview account={selectedAccount} accredits={accredits} causes={causes} loading={loading} message={message} />;
  }

  return (
    <div className="w-full h-full px-0 py-0">
      {message.text && <p className={`mgcf-toast px-4 py-3 text-sm font-semibold ${message.error ? "mgcf-toast--error" : "mgcf-toast--success"}`}>{message.text}</p>}

      {formOpen && (
        <form onSubmit={save} className="mb-2 rounded-lg border border-gray-300 bg-white p-5">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">{editing ? "Modifica accredito" : "Nuovo accredito"}</h2><button type="button" onClick={closeForm} className="text-xs text-slate-500 hover:text-slate-800">Chiudi</button></div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">Data accredito *<input type="date" required value={fields.movementDate} onChange={(event) => setFields((current) => ({ ...current, movementDate: event.target.value }))} className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400" /></label>
            <label className="text-sm font-medium text-slate-700">Importo accredito *<input type="number" required min="0.01" step="0.01" value={fields.amount} onChange={(event) => setFields((current) => ({ ...current, amount: event.target.value }))} placeholder="0,00" className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400" /></label>
            <div className="text-sm font-medium text-slate-700">Conto / banca<div className="mt-2 flex min-h-12 w-full items-center gap-3 rounded-md border border-gray-300 bg-slate-50 px-4 text-sm font-semibold" style={{ color: selectedAccount?.color || "#334155" }}><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: selectedAccount?.color || "#64748b" }} />{selectedAccount?.name}{selectedAccount?.bank ? ` – ${selectedAccount.bank}` : ""}</div></div>
            <label className="text-sm font-medium text-slate-700">Causale accredito *<select required value={fields.causeId} onChange={(event) => setFields((current) => ({ ...current, causeId: event.target.value }))} className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400"><option value="">Seleziona una causale</option>{activeCauses.map((cause) => <option key={cause.id} value={cause.id}>{cause.name}</option>)}</select><Link to="/settings/causes" className="mt-2 inline-block text-xs text-indigo-700 hover:text-indigo-900">Gestisci causali</Link></label>
            <label className="text-sm font-medium text-slate-700 md:col-span-2">Note<textarea rows="3" value={fields.notes} onChange={(event) => setFields((current) => ({ ...current, notes: event.target.value }))} placeholder="Nota facoltativa" className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400" /></label>
          </div>
          <div className="mt-4 flex justify-end"><button type="submit" disabled={saving || !selectedAccount || activeCauses.length === 0} className="h-9 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 text-sm font-semibold text-white hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-60">{saving ? "Salvataggio..." : "Salva accredito"}</button></div>
        </form>
      )}

      <div className="mt-0 overflow-visible rounded-xl border border-gray-300 bg-white">
        <div className="relative z-[300] rounded-t-xl bg-[#e4e4e4] px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileDown className="h-5 w-5 shrink-0 text-black" />
                <h1 className="text-xl text-black">Accrediti {selectedAccount?.name ?? "conto"} anno {globalFilters.year}</h1>
              </div>
              <p className="mt-1 text-sm text-black">Gestisci gli accrediti, visualizza l'andamento e i totali per periodo.</p>
            </div>
            <div className="relative z-[310] max-w-full pb-1 lg:ml-auto">
              <div className="ml-auto flex w-max flex-nowrap items-center rounded-md border border-gray-300 bg-white p-1 text-slate-900 backdrop-blur-sm">
                <span className="flex h-9 items-center rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-slate-600">{globalFilters.year}</span>
                <div className="relative ml-2 shrink-0" data-accredits-month-menu>
                  <button
                    type="button"
                    onClick={() => setMonthMenuOpen((current) => !current)}
                    className="flex h-9 min-w-[150px] items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition-colors hover:border-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                  >
                    <span>{selectedMonthLabel}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-600 transition-transform ${monthMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {monthMenuOpen && (
                    <div className="absolute right-0 top-full z-[9999] mt-4 w-[220px] rounded-lg border border-gray-300 bg-white p-2 text-slate-900 shadow-lg">
                      <div>
                        <button type="button" onClick={() => applyMonthFilter("")} className="flex h-8 w-full items-center rounded-md px-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-white/70 hover:text-orange-700">
                          Tutti i mesi
                        </button>
                        {months.map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => applyMonthFilter(value)}
                            className={`flex h-8 w-full items-center rounded-md px-3 text-left text-sm transition-colors ${globalFilters.month === value ? "bg-orange-500 font-semibold text-white" : "text-slate-700 hover:bg-white/70 hover:text-orange-700"}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={openNew}
                  aria-label="Nuovo accredito"
                  title="Nuovo accredito"
                  className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orange-500 text-white transition-colors hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Stat label={statisticLabels.amount} value={currency.format(metrics.total)} icon={Banknote} tone="amount" />
            <Stat label={`Accrediti del ${globalFilters.year}`} value={String(metrics.yearCount)} icon={Calculator} tone="count" />
            <Stat label={`Importo del ${globalFilters.year}`} value={currency.format(metrics.yearTotal)} icon={Calculator} tone="average" />
            <Stat
              label={`Variazione ${metrics.currentPeriodLabel}`}
              value={`${metrics.difference >= 0 ? "+" : ""}${currency.format(metrics.difference)}`}
              detail={`Rispetto a ${metrics.previousPeriodLabel}: ${currency.format(metrics.previousMonth)}${metrics.percentage === null ? "" : ` ${metrics.percentage >= 0 ? "+" : ""}${metrics.percentage.toFixed(1)}%`}`}
              icon={metrics.difference < 0 ? AlertTriangle : metrics.difference > 0 ? TrendingUp : Calculator}
              tone={metrics.difference < 0 ? "danger" : metrics.difference > 0 ? "success" : "average"}
            />
          </div>
        </div>

        <div className="border-t border-gray-300 px-4 py-2">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div><h2 className="text-base font-semibold text-slate-900">Lista accrediti</h2><p className="mt-0.5 text-xs text-slate-500">{visibleAccredits.length} risultati nel periodo selezionato &mdash; totale <strong><Amount>{currency.format(visibleAccredits.reduce((sum, item) => sum + Number(item.amount), 0))}</Amount></strong></p></div>
            <div className="flex flex-wrap items-end gap-2">
              <FilterField label="Ordina per"><FilterSelect compact ariaLabel="Ordina storico" value={listFilters.sortBy} onChange={(event) => setListFilters((current) => ({ ...current, sortBy: event.target.value }))}><option value="date">Data</option><option value="cause">Causale</option></FilterSelect></FilterField>
              <FilterField label="Dal"><input type="date" value={listFilters.dateFrom} onChange={(event) => setListFilters((current) => ({ ...current, dateFrom: event.target.value }))} className="h-8 rounded-md border border-gray-300 px-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400" /></FilterField>
              <FilterField label="Al"><input type="date" value={listFilters.dateTo} onChange={(event) => setListFilters((current) => ({ ...current, dateTo: event.target.value }))} className="h-8 rounded-md border border-gray-300 px-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400" /></FilterField>
              <FilterField label="Causale"><FilterSelect compact ariaLabel="Filtra storico per causale" value={listFilters.causeId} onChange={(event) => setListFilters((current) => ({ ...current, causeId: event.target.value }))}><option value="">Tutte</option>{causes.map((cause) => <option key={cause.id} value={cause.id}>{cause.name}</option>)}</FilterSelect></FilterField>
              {(listFilters.dateFrom || listFilters.dateTo || listFilters.causeId) && <button type="button" onClick={() => setListFilters({ dateFrom: "", dateTo: "", causeId: "", sortBy: listFilters.sortBy })} className="h-8 rounded-md border border-gray-300 px-3 text-xs text-slate-600 hover:bg-slate-50">Azzera</button>}
            </div>
          </div>
        </div>

        {loading ? <p className="px-6 py-5 text-sm text-slate-500">Caricamento...</p> : visibleAccredits.length ? (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[120px_minmax(160px,1fr)_minmax(180px,1fr)_130px_72px] items-center gap-4 border-b border-gray-300 bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <span>Data</span><span>Conto</span><span>Causale</span><span className="text-right">Importo</span><span />
              </div>
              <div className="divide-y divide-slate-100">
                {visibleAccredits.map((item) => (
                  <div key={item.id} title={item.notes || undefined} className="grid grid-cols-[120px_minmax(160px,1fr)_minmax(180px,1fr)_130px_72px] items-center gap-4 px-5 py-2.5 text-[13px]">
                    <span className="tabular-nums text-slate-500">{dateFormatter.format(new Date(`${String(item.movementDate).slice(0, 10)}T00:00:00`))}</span>
                    <span className="flex min-w-0 items-center gap-2 font-semibold" style={{ color: item.accountColor || "#475569" }}><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.accountColor || "#64748b" }} /><span className="truncate">{item.accountName}</span></span>
                    <span className="truncate text-slate-700">{item.causeName}</span>
                    <strong className="text-right tabular-nums text-slate-900">
                      <Amount>{currency.format(Number(item.amount))}</Amount>
                    </strong>
                    <div className="flex items-center justify-end gap-1"><button type="button" onClick={() => openEdit(item)} aria-label={`Modifica accredito ${item.causeName}`} className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"><SquarePen className="h-4 w-4" /></button><button type="button" onClick={() => setDeleting(item)} aria-label={`Elimina accredito ${item.causeName}`} className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-600 hover:bg-red-200"><Trash2 className="h-4 w-4" /></button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : <p className="px-4 py-6 text-center text-xs text-slate-400">Nessun accredito corrisponde ai filtri</p>}
      </div>

      {deleting && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-6"><div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8"><h2 className="text-xl font-semibold text-slate-900">Eliminare l'accredito?</h2><p className="mt-3 text-sm text-slate-600">L'accredito di <strong>{currency.format(Number(deleting.amount))}</strong> verr� eliminato definitivamente.</p><div className="mt-8 flex justify-end gap-3"><button type="button" onClick={() => setDeleting(null)} disabled={saving} className="rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">Annulla</button><button type="button" onClick={confirmDelete} disabled={saving} className="rounded-md bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3 font-semibold text-white hover:from-red-700 hover:to-rose-700 disabled:opacity-60">{saving ? "Eliminazione..." : "Elimina"}</button></div></div></div>}
    </div>
  );
}

function Stat({ label, value, detail, icon: Icon, tone = "default", danger = false }) {
  const toneClasses = {
    default: "bg-gradient-to-br from-slate-100 to-slate-50 border-slate-200 text-slate-900",
    amount: "bg-gradient-to-br from-blue-400 to-indigo-400 border-blue-500 text-white",
    count: "bg-gradient-to-br from-orange-400 to-amber-400 border-orange-500 text-white",
    average: "bg-gradient-to-br from-purple-400 to-indigo-400 border-purple-500 text-white",
    success: "bg-gradient-to-br from-emerald-400 to-teal-400 border-emerald-500 text-white",
    danger: "bg-gradient-to-br from-red-500 to-rose-500 border-red-600 text-white",
  };

  const color = danger || tone === "danger" ? toneClasses.danger : (toneClasses[tone] ?? toneClasses.default);
  const iconColor = tone === "default" ? "text-slate-600" : "text-white";
  const labelColor = tone === "default" ? "text-slate-500" : "text-white";
  const textColor = tone === "default" ? "text-slate-900" : "text-white";
  const isNegative = typeof value === "string" && value.trim().startsWith("-");

  return (
    <div role={danger || tone === "danger" ? "alert" : undefined} className={`rounded-lg border px-4 py-3 shadow-sm ${color}`}>
      <div className="flex justify-between">
        <span className={`text-[10px] font-medium uppercase tracking-wide ${labelColor}`}>{label}</span>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <strong className={`mt-1.5 block min-h-8 text-2xl font-bold ${isNegative ? "text-slate-900" : textColor}`}>
        <Amount>{value || "\u00A0"}</Amount>
      </strong>
      {detail && <span className={`mt-0.5 block text-[10px] ${labelColor}`}><Amount>{detail}</Amount></span>}
    </div>
  );
}

function FilterSelect({ ariaLabel, value, onChange, children, compact = false, widthClass = "w-32" }) {
  return (
    <div className="relative shrink-0">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={onChange}
        className={`appearance-none truncate rounded-md border border-orange-200 bg-orange-50 pl-2.5 pr-7 text-slate-900 shadow-sm outline-none transition-colors hover:border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-300 ${widthClass} ${compact ? "h-8 text-xs" : "h-9 text-xs"}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-orange-500" />
    </div>
  );
}

function FilterField({ label, children }) {
  return <label className="flex flex-col gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}{children}</label>;
}

function AccountAccreditsOverview({ account, accredits, causes, loading, message }) {
  const today = localDate();
  const accountAccredits = useMemo(() => accredits.filter((item) => String(item.accountId) === String(account?.id)), [account?.id, accredits]);
  const [filters, setFilters] = useState({ month: today.slice(5, 7), year: today.slice(0, 4), causeId: "" });
  const years = useMemo(() => accountingYears(accountAccredits.map((item) => item.movementDate)).reverse(), [accountAccredits]);
  const filtered = useMemo(() => accountAccredits.filter((item) => {
    const date = String(item.movementDate);
    if (filters.month && date.slice(5, 7) !== filters.month) return false;
    if (filters.year && date.slice(0, 4) !== filters.year) return false;
    if (filters.causeId && String(item.causeId) !== filters.causeId) return false;
    return true;
  }).sort((first, second) => String(second.movementDate).localeCompare(String(first.movementDate)) || second.id - first.id), [accountAccredits, filters]);
  const total = filtered.reduce((sum, item) => sum + Number(item.amount), 0);
  const overallTotal = accountAccredits.reduce((sum, item) => sum + Number(item.amount), 0);
  const recordedYears = new Set(accountAccredits.map((item) => String(item.movementDate).slice(0, 4)).filter(Boolean));
  const annualData = Object.values(accountAccredits.reduce((result, item) => {
    const year = String(item.movementDate).slice(0, 4);
    result[year] ??= { year, count: 0, total: 0 };
    result[year].count += 1;
    result[year].total += Number(item.amount);
    return result;
  }, {})).sort((first, second) => Number(first.year) - Number(second.year));
  const causeData = Object.values(accountAccredits.reduce((result, item) => {
    const key = item.causeId || item.causeName;
    result[key] ??= { accountId: key, name: item.causeName, color: "#f59e0b", count: 0, total: 0 };
    result[key].count += 1;
    result[key].total += Number(item.amount);
    return result;
  }, {})).sort((first, second) => second.total - first.total);
  const comparisonYear = filters.year || today.slice(0, 4);
  const comparisonMonth = filters.month || today.slice(5, 7);
  const currentKey = `${comparisonYear}-${comparisonMonth}`;
  const previousKey = shiftedMonthKey(comparisonYear, comparisonMonth, -1);
  const causePool = filters.causeId ? accountAccredits.filter((item) => String(item.causeId) === filters.causeId) : accountAccredits;
  const currentTotal = causePool.filter((item) => monthKey(item.movementDate) === currentKey).reduce((sum, item) => sum + Number(item.amount), 0);
  const previousTotal = causePool.filter((item) => monthKey(item.movementDate) === previousKey).reduce((sum, item) => sum + Number(item.amount), 0);
  const difference = currentTotal - previousTotal;
  const labels = periodStatisticLabels({ accountId: String(account?.id ?? ""), ...filters });
  const allSelected = !filters.month && !filters.year && !filters.causeId;
  const color = account?.color || "#64748b";

  if (!account) return <p className="text-sm text-slate-500">Conto non trovato.</p>;

  return <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-3">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><Link to="/accounting/accredits" className="mb-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-700"><ArrowLeft className="h-3.5 w-3.5" />Tutti i conti</Link><div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} /><h1 className="text-3xl font-bold" style={{ color }}>{account.name}</h1></div><p className="mt-2 text-slate-500">Panoramica storica completa degli accrediti del conto.</p></div><Link to={`/accounting/accredits?account=${account.id}&year=${today.slice(0, 4)}`} className="flex h-9 items-center rounded-md bg-indigo-500 px-4 text-sm font-semibold text-white hover:bg-indigo-600">Apri anno {today.slice(0, 4)}</Link></div>
    {message.text && <p className={`mgcf-toast px-4 py-3 text-sm font-semibold ${message.error ? "mgcf-toast--error" : "mgcf-toast--success"}`}>{message.text}</p>}
    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"><Stat label="Importo complessivo" value={currency.format(overallTotal)} icon={Banknote} /><Stat label="Accrediti complessivi" value={String(accountAccredits.length)} icon={Calculator} /><Stat label="Media complessiva" value={currency.format(accountAccredits.length ? overallTotal / accountAccredits.length : 0)} icon={Calculator} /><Stat label="Anni registrati" value={String(recordedYears.size)} icon={TrendingUp} /></div>
    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2"><AnnualOverviewChart data={annualData} /><AccountOverviewChart data={causeData} title="Distribuzione per causale" description="Peso delle causali sul totale storico del conto." /></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"><div><h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Impostazioni del conto</h2><p className="mt-0.5 text-xs text-slate-400">Configurazione del conto e causali disponibili.</p></div><div className="flex gap-2"><Link to="/settings/accounts" className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-orange-50 hover:text-orange-700">Gestisci conto</Link><Link to="/settings/causes" className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-orange-50 hover:text-orange-700">Gestisci causali</Link></div></div>
    <div className="mt-6 flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-lg font-semibold text-slate-900">Analisi del conto</h2><p className="mt-0.5 text-xs text-slate-500">Filtra mesi, anni e causali senza cambiare conto.</p></div><div className="flex flex-wrap gap-1.5"><FilterSelect widthClass="w-32" ariaLabel="Filtra per mese" value={filters.month} onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value }))}><option value="">Tutti i mesi</option>{months.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</FilterSelect><FilterSelect widthClass="w-24" ariaLabel="Filtra per anno" value={filters.year} onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value }))}><option value="">Tutti gli anni</option>{years.map((year) => <option key={year}>{year}</option>)}</FilterSelect><FilterSelect widthClass="w-36" ariaLabel="Filtra per causale" value={filters.causeId} onChange={(event) => setFilters((current) => ({ ...current, causeId: event.target.value }))}><option value="">Tutte le causali</option>{causes.map((cause) => <option key={cause.id} value={cause.id}>{cause.name}</option>)}</FilterSelect><button type="button" onClick={() => setFilters({ month: "", year: "", causeId: "" })} disabled={allSelected} className="h-9 rounded-md border border-slate-300 px-3 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40">Visualizza tutto</button></div></div>
    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"><Stat label={labels.amount} value={currency.format(total)} icon={Banknote} /><Stat label={labels.count} value={String(filtered.length)} icon={Calculator} /><Stat label={labels.average} value={currency.format(filtered.length ? total / filtered.length : 0)} icon={Calculator} /><Stat label={`Variazione ${monthKeyLabel(currentKey)}`} value={`${difference >= 0 ? "+" : ""}${currency.format(difference)}`} detail={`Rispetto a ${monthKeyLabel(previousKey)}: ${currency.format(previousTotal)}`} icon={difference < 0 ? AlertTriangle : TrendingUp} tone={difference < 0 ? "danger" : difference > 0 ? "success" : "neutral"} /></div>
    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="border-b border-slate-200 px-5 py-4"><h2 className="text-lg font-semibold text-slate-900">Storico del conto</h2><p className="mt-1 text-sm text-slate-500">{filtered.length} accrediti nella selezione corrente.</p></div>{loading ? <p className="px-5 py-6 text-sm text-slate-500">Caricamento...</p> : filtered.length ? <div className="overflow-x-auto"><div className="min-w-[620px]"><div className="grid grid-cols-[120px_minmax(180px,1fr)_130px_28px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><span>Data</span><span>Causale</span><span className="text-right">Importo</span><span /></div><div className="divide-y divide-slate-100">{filtered.map((item) => <Link key={item.id} to={`/accounting/accredits?account=${account.id}&year=${String(item.movementDate).slice(0, 4)}`} className="grid grid-cols-[120px_minmax(180px,1fr)_130px_28px] items-center gap-4 px-5 py-2.5 text-[13px] hover:bg-orange-50"><span className="tabular-nums text-slate-500">{dateFormatter.format(new Date(`${String(item.movementDate).slice(0, 10)}T00:00:00`))}</span><span className="truncate text-slate-700">{item.causeName}</span><strong className="text-right tabular-nums text-slate-900">{currency.format(Number(item.amount))}</strong><ChevronRight className="h-4 w-4 text-slate-400" /></Link>)}</div></div></div> : <p className="px-5 py-8 text-center text-sm text-slate-400">Nessun accredito corrisponde ai filtri</p>}</div>
  </div>;
}

function AccreditsOverview({ accounts, accredits, causes, loading, message }) {
  const today = localDate();
  const [filters, setFilters] = useState({ accountId: "", month: today.slice(5, 7), year: today.slice(0, 4), causeId: "" });
  const years = useMemo(() => accountingYears(accredits.map((item) => item.movementDate)).reverse(), [accredits]);
  const filtered = useMemo(() => accredits.filter((item) => {
    const date = String(item.movementDate);
    if (filters.accountId && String(item.accountId) !== filters.accountId) return false;
    if (filters.month && date.slice(5, 7) !== filters.month) return false;
    if (filters.year && date.slice(0, 4) !== filters.year) return false;
    if (filters.causeId && String(item.causeId) !== filters.causeId) return false;
    return true;
  }).sort((first, second) => String(second.movementDate).localeCompare(String(first.movementDate)) || second.id - first.id), [accredits, filters]);

  const total = filtered.reduce((sum, item) => sum + Number(item.amount), 0);
  const comparisonYear = filters.year || today.slice(0, 4);
  const comparisonMonth = filters.month || today.slice(5, 7);
  const currentKey = `${comparisonYear}-${comparisonMonth}`;
  const previousKey = shiftedMonthKey(comparisonYear, comparisonMonth, -1);
  const comparisonPool = accredits.filter((item) => {
    if (filters.accountId && String(item.accountId) !== filters.accountId) return false;
    if (filters.causeId && String(item.causeId) !== filters.causeId) return false;
    return true;
  });
  const currentTotal = comparisonPool.filter((item) => monthKey(item.movementDate) === currentKey).reduce((sum, item) => sum + Number(item.amount), 0);
  const previousTotal = comparisonPool.filter((item) => monthKey(item.movementDate) === previousKey).reduce((sum, item) => sum + Number(item.amount), 0);
  const difference = currentTotal - previousTotal;
  const labels = periodStatisticLabels(filters);
  const summaries = Object.values(filtered.reduce((result, item) => {
    result[item.accountId] ??= { accountId: item.accountId, name: item.accountName, color: item.accountColor, count: 0, total: 0 };
    result[item.accountId].count += 1;
    result[item.accountId].total += Number(item.amount);
    return result;
  }, {})).sort((first, second) => second.total - first.total);
  const overallTotal = accredits.reduce((sum, item) => sum + Number(item.amount), 0);
  const overallYears = new Set(accredits.map((item) => String(item.movementDate).slice(0, 4)).filter(Boolean));
  const annualData = Object.values(accredits.reduce((result, item) => {
    const year = String(item.movementDate).slice(0, 4);
    result[year] ??= { year, count: 0, total: 0 };
    result[year].count += 1;
    result[year].total += Number(item.amount);
    return result;
  }, {})).sort((first, second) => Number(first.year) - Number(second.year));
  const overallByAccount = Object.values(accredits.reduce((result, item) => {
    result[item.accountId] ??= { accountId: item.accountId, name: item.accountName, color: item.accountColor, count: 0, total: 0 };
    result[item.accountId].count += 1;
    result[item.accountId].total += Number(item.amount);
    return result;
  }, {})).sort((first, second) => second.total - first.total);
  const allSelected = !filters.accountId && !filters.month && !filters.year && !filters.causeId;
  const selectedAccount = accounts.find((account) => String(account.id) === filters.accountId);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-3">
      {selectedAccount && (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: selectedAccount.color || "#64748b" }} />
            <h1 className="text-2xl font-semibold" style={{ color: selectedAccount.color || "#0f172a" }}>ACCREDITI {selectedAccount.name.toUpperCase()}</h1>
          </div>
          <p className="mt-2 text-slate-500">Gestisci gli accrediti del conto, visualizza l'andamento e i totali per periodo.</p>
        </div>
      )}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div><div className="flex items-center gap-3"><Banknote className="h-8 w-8 text-indigo-500" /><h1 className="text-2xl font-semibold text-slate-900">Panoramica accrediti</h1></div><p className="mt-2 text-slate-500">Consulta tutti gli accrediti e restringi la panoramica per conto, periodo o causale.</p></div>
        <div className="flex max-w-full flex-wrap items-center justify-end gap-1.5">
          <FilterSelect widthClass="w-36" ariaLabel="Filtra per conto" value={filters.accountId} onChange={(event) => setFilters((current) => ({ ...current, accountId: event.target.value }))}><option value="">Tutti i conti</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</FilterSelect>
          <FilterSelect widthClass="w-32" ariaLabel="Filtra per mese" value={filters.month} onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value }))}><option value="">Tutti i mesi</option>{months.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</FilterSelect>
          <FilterSelect widthClass="w-24" ariaLabel="Filtra per anno" value={filters.year} onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value }))}><option value="">Tutti gli anni</option>{years.map((year) => <option key={year}>{year}</option>)}</FilterSelect>
          <FilterSelect widthClass="w-36" ariaLabel="Filtra per causale" value={filters.causeId} onChange={(event) => setFilters((current) => ({ ...current, causeId: event.target.value }))}><option value="">Tutte le causali</option>{causes.map((cause) => <option key={cause.id} value={cause.id}>{cause.name}</option>)}</FilterSelect>
          <button type="button" onClick={() => setFilters({ accountId: "", month: "", year: "", causeId: "" })} disabled={allSelected} className="h-9 rounded-md border border-slate-300 px-3 text-xs text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40">Visualizza tutto</button>
        </div>
      </div>
      {message.text && <p className={`mgcf-toast px-4 py-3 text-sm font-semibold ${message.error ? "mgcf-toast--error" : "mgcf-toast--success"}`}>{message.text}</p>}
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Importo complessivo" value={currency.format(overallTotal)} icon={Banknote} />
        <Stat label="Accrediti complessivi" value={String(accredits.length)} icon={Calculator} />
        <Stat label="Media complessiva" value={currency.format(accredits.length ? overallTotal / accredits.length : 0)} icon={Calculator} />
        <Stat label="Anni registrati" value={String(overallYears.size)} icon={TrendingUp} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AnnualOverviewChart data={annualData} />
        <AccountOverviewChart data={overallByAccount} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"><div><h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Impostazioni generali</h2><p className="mt-0.5 text-xs text-slate-400">Conti e causali utilizzati da tutti gli accrediti.</p></div><div className="flex gap-2"><Link to="/settings/accounts" className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-700">Gestisci conti</Link><Link to="/settings/causes" className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-700">Gestisci causali</Link></div></div>
      <div className="mt-6 flex items-end justify-between border-b border-slate-200 pb-2"><div><h2 className="text-lg font-semibold text-slate-900">Analisi filtrata</h2><p className="mt-0.5 text-xs text-slate-500">I dati seguenti cambiano in base ai filtri selezionati.</p></div></div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat label={labels.amount} value={currency.format(total)} icon={Banknote} />
        <Stat label={labels.count} value={String(filtered.length)} icon={Calculator} />
        <Stat label={labels.average} value={currency.format(filtered.length ? total / filtered.length : 0)} icon={Calculator} />
        <Stat label={`Variazione ${monthKeyLabel(currentKey)}`} value={`${difference >= 0 ? "+" : ""}${currency.format(difference)}`} detail={`Rispetto a ${monthKeyLabel(previousKey)}: ${currency.format(previousTotal)}`} icon={difference < 0 ? AlertTriangle : TrendingUp} tone={difference < 0 ? "danger" : difference > 0 ? "success" : "default"} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5"><h2 className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Per conto</h2>{summaries.length ? summaries.map((item) => <Link key={item.accountId} to={`/accounting/accredits?account=${item.accountId}&year=${filters.year || today.slice(0, 4)}`} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs hover:border-indigo-300 hover:bg-indigo-50"><span className="font-semibold" style={{ color: item.color || "#475569" }}>{item.name}</span><span className="text-slate-400">{item.count}</span><strong className="tabular-nums text-slate-800">{currency.format(item.total)}</strong></Link>) : <span className="text-xs text-slate-400">Nessun accredito nel periodo</span>}</div>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="text-lg font-semibold text-slate-900">Storico generale</h2><p className="mt-1 text-sm text-slate-500">{filtered.length} accrediti nella selezione corrente.</p></div>
        {loading ? <p className="px-5 py-6 text-sm text-slate-500">Caricamento...</p> : filtered.length ? <div className="overflow-x-auto"><div className="min-w-[720px]"><div className="grid grid-cols-[120px_minmax(160px,1fr)_minmax(180px,1fr)_130px_28px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><span>Data</span><span>Conto</span><span>Causale</span><span className="text-right">Importo</span><span /></div><div className="divide-y divide-slate-100">{filtered.map((item) => <Link key={item.id} to={`/accounting/accredits?account=${item.accountId}&year=${String(item.movementDate).slice(0, 4)}`} className="grid grid-cols-[120px_minmax(160px,1fr)_minmax(180px,1fr)_130px_28px] items-center gap-4 px-5 py-2.5 text-[13px] hover:bg-indigo-50"><span className="tabular-nums text-slate-500">{dateFormatter.format(new Date(`${String(item.movementDate).slice(0, 10)}T00:00:00`))}</span><span className="font-semibold" style={{ color: item.accountColor || "#475569" }}>{item.accountName}</span><span className="truncate text-slate-700">{item.causeName}</span><strong className="text-right tabular-nums text-slate-900">{currency.format(Number(item.amount))}</strong><ChevronRight className="h-4 w-4 text-slate-400" /></Link>)}</div></div></div> : <p className="px-5 py-8 text-center text-sm text-slate-400">Nessun accredito corrisponde ai filtri</p>}
      </div>
    </div>
  );
}

function AnnualOverviewChart({ data }) {
  const max = Math.max(...data.map((item) => item.total), 1);
  return <div className="rounded-lg border border-slate-200 bg-white px-4 py-3"><div className="flex items-center justify-between"><div><h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Andamento per anno</h2><p className="mt-0.5 text-xs text-slate-400">Importo e numero degli accrediti registrati.</p></div></div>{data.length ? <div className="mt-4 flex h-32 items-end gap-3 border-b border-slate-200 px-2">{data.map((item) => <div key={item.year} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${item.year}: ${currency.format(item.total)} � ${item.count} accrediti`}><span className="text-[9px] font-medium tabular-nums text-slate-500">{item.count}</span><div className="w-full max-w-12 rounded-t-sm bg-amber-400" style={{ height: `${Math.max((item.total / max) * 88, 4)}px` }} /><span className="pb-1 text-[10px] font-semibold text-slate-600">{item.year}</span></div>)}</div> : <p className="mt-8 text-center text-sm text-slate-400">Nessun dato disponibile</p>}</div>;
}

function AccountOverviewChart({ data, title = "Distribuzione per conto", description = "Peso di ciascun conto sul totale storico." }) {
  const max = Math.max(...data.map((item) => item.total), 1);
  return <div className="rounded-lg border border-slate-200 bg-white px-4 py-3"><h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</h2><p className="mt-0.5 text-xs text-slate-400">{description}</p>{data.length ? <div className="mt-4 space-y-3">{data.map((item) => <div key={item.accountId}><div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="font-semibold" style={{ color: item.color || "#475569" }}>{item.name}</span><span className="tabular-nums text-slate-500">{item.count} � <strong className="text-slate-800">{currency.format(item.total)}</strong></span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${Math.max((item.total / max) * 100, 2)}%`, backgroundColor: item.color || "#f59e0b" }} /></div></div>)}</div> : <p className="mt-8 text-center text-sm text-slate-400">Nessun dato disponibile</p>}</div>;
}
