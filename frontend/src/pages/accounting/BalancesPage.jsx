import { TrendingUp, TrendingDown, Banknote, ChevronDown, Wallet, BarChart2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Amount from "../../components/ui/Amount";
import { getAccounts } from "../../services/accountService";
import { getAccountStatements } from "../../services/accountStatementService";
import { accountingYears } from "../../utils/accountingPeriods";
import PageMask from "../../components/layout/PageMask";

const currency = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

const months = [
  ["01", "Gennaio"], ["02", "Febbraio"], ["03", "Marzo"], ["04", "Aprile"],
  ["05", "Maggio"], ["06", "Giugno"], ["07", "Luglio"], ["08", "Agosto"],
  ["09", "Settembre"], ["10", "Ottobre"], ["11", "Novembre"], ["12", "Dicembre"],
];

function monthLabel(period) {
  const month = String(period).slice(5, 7);
  return months.find(([v]) => v === month)?.[1] ?? month;
}

export default function BalancesPage() {
  const [accounts, setAccounts] = useState([]);
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [openAccounts, setOpenAccounts] = useState({});
  const [hoveredAccount, setHoveredAccount] = useState(null);

  useEffect(() => {
    Promise.all([getAccounts(), getAccountStatements()])
      .then(([accountsData, statementsData]) => {
        setAccounts(accountsData.filter((a) => a.active));
        setStatements(statementsData);
      })
      .finally(() => setLoading(false));
  }, []);

  const years = useMemo(() => {
    return accountingYears(
      [],
      statements.map((s) => s.period),
    );
  }, [statements]);

  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[years.length - 1]);
    }
  }, [years]);

  function toggleAccount(id) {
    setOpenAccounts((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // Statements for selected year, per account
  const statementsByAccount = useMemo(() => {
    const map = {};
    for (const account of accounts) {
      map[account.id] = statements
        .filter((s) => String(s.accountId) === String(account.id) && String(s.period).startsWith(selectedYear))
        .sort((a, b) => String(a.period).localeCompare(String(b.period)));
    }
    return map;
  }, [accounts, statements, selectedYear]);

  // Latest balance for each account (last statement in selected year or overall)
  function latestBalance(accountId) {
    const list = statementsByAccount[accountId];
    if (!list || list.length === 0) return null;
    return list[list.length - 1].currentBalance;
  }

  // Total balance per month across all accounts
  const totalByMonth = useMemo(() => {
    const map = {};
    for (const account of accounts) {
      const list = statementsByAccount[account.id] ?? [];
      for (const stmt of list) {
        const key = String(stmt.period).slice(0, 7);
        if (!map[key]) map[key] = 0;
        map[key] += Number(stmt.currentBalance);
      }
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [accounts, statementsByAccount]);

  return (
    <PageMask icon={BarChart2} title="Visualizza saldi conto" description="Consulta il saldo di ogni conto, mese per mese.">
      {/* Year selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Anno:</span>
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="appearance-none rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-slate-600 focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {loading && <p className="text-sm text-slate-400">Caricamento...</p>}

      {!loading && accounts.length === 0 && (
        <p className="text-sm text-slate-400">Nessun conto attivo trovato.</p>
      )}

      {!loading && accounts.map((account) => {
        const isOpen = openAccounts[account.id];
        const yearStatements = statementsByAccount[account.id] ?? [];
        const balance = latestBalance(account.id);

        return (
          <div key={account.id} className="overflow-hidden rounded-lg border border-gray-200">
            {/* Account header */}
            <button
              type="button"
              onClick={() => toggleAccount(account.id)}
              onMouseEnter={() => setHoveredAccount(account.id)}
              onMouseLeave={() => setHoveredAccount(null)}
              className="flex w-full items-center gap-3 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100"
            >
              <Banknote className="h-5 w-5 shrink-0 !text-black" />
              <span className="flex-1 text-sm font-semibold text-slate-700">{account.name}</span>
              {balance !== null && (
                <span className={`text-sm font-semibold ${Number(balance) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  <Amount>{currency.format(balance)}</Amount>
                </span>
              )}
              {balance === null && (
                <span className="text-xs text-slate-400">Nessun dato</span>
              )}
              <ChevronDown className={`h-4 w-4 shrink-0 !text-black transition-transform ${isOpen || hoveredAccount === account.id ? "rotate-0" : "-rotate-90"}`} />
            </button>

            {/* Monthly table */}
            {isOpen && (
              <div className="divide-y divide-gray-100">
                {yearStatements.length === 0 && (
                  <p className="px-4 py-3 text-sm text-slate-400">Nessun estratto disponibile per {selectedYear}.</p>
                )}
                {yearStatements.map((stmt) => {
                  const diff = Number(stmt.currentBalance) - Number(stmt.previousBalance);
                  const hasAccredits = diff !== 0;
                  return (
                    <div key={stmt.id} className="flex items-center px-4 py-2.5">
                      {/* Month */}
                      <span className="flex-1 text-sm text-slate-500">{monthLabel(stmt.period)} {selectedYear}</span>

                      {/* Variation */}
                      <div className="flex items-center gap-1 mr-4">
                        {diff > 0 && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                        {diff < 0 && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                        {diff !== 0 && (
                          <span className={`text-xs font-medium ${diff > 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {diff > 0 ? "+" : ""}<Amount>{currency.format(diff)}</Amount>
                          </span>
                        )}
                        {diff === 0 && <span className="text-xs text-slate-400">Invariato</span>}
                      </div>

                      {/* Current balance */}
                      <span className={`shrink-0 w-28 text-right text-sm font-semibold ${Number(stmt.currentBalance) >= 0 ? "text-slate-800" : "text-red-600"}`}>
                        <Amount>{currency.format(stmt.currentBalance)}</Amount>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {/* Total balance across all accounts per month */}
      {!loading && totalByMonth.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-indigo-200">
          <div className="flex items-center gap-3 bg-indigo-50 px-4 py-3">
            <Wallet className="h-5 w-5 shrink-0 !text-black" />
            <span className="flex-1 text-sm font-semibold text-slate-700">Saldo totale tutti i conti</span>
          </div>
          <div className="divide-y divide-gray-100">
            {totalByMonth.map(([key, total], index) => {
              const prevTotal = index > 0 ? totalByMonth[index - 1][1] : null;
              const diff = prevTotal !== null ? total - prevTotal : null;
              return (
                <div key={key} className="flex items-center px-4 py-2.5">
                  <span className="flex-1 text-sm text-slate-500">{monthLabel(key + "-01")} {selectedYear}</span>
                  {diff !== null && (
                    <div className="flex items-center gap-1 mr-4">
                      {diff > 0 && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                      {diff < 0 && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                      {diff !== 0 && (
                        <span className={`text-xs font-medium ${diff > 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {diff > 0 ? "+" : ""}<Amount>{currency.format(diff)}</Amount>
                        </span>
                      )}
                      {diff === 0 && <span className="text-xs text-slate-400">Invariato</span>}
                    </div>
                  )}
                  <span className={`shrink-0 w-28 text-right text-sm font-semibold ${total >= 0 ? "text-slate-800" : "text-red-600"}`}>
                    <Amount>{currency.format(total)}</Amount>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageMask>
  );
}
