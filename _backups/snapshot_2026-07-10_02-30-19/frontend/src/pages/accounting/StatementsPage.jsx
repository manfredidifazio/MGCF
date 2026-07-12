import {
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getAccounts } from "../../services/accountService";
import { getAccountStatements } from "../../services/accountStatementService";
import { getAccredits } from "../../services/accreditService";

const currency = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

export default function StatementsPage() {
  const [accounts, setAccounts] = useState([]);
  const [statements, setStatements] = useState([]);
  const [accredits, setAccredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [expandedAccounts, setExpandedAccounts] = useState({});

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

  // Calcola lista conti con anni disponibili
  const accountsWithYears = useMemo(() => {
    return accounts.map((account) => {
      const accountStatements = statements.filter((s) => String(s.accountId) === String(account.id));
      
      const yearsData = {};
      
      // Raggruppa per anno
      accountStatements.forEach((stmt) => {
        const year = String(stmt.period).slice(0, 4);
        if (!yearsData[year]) {
          yearsData[year] = { months: new Set(), balance: 0 };
        }
        yearsData[year].months.add(String(stmt.period).slice(0, 7));
        yearsData[year].balance = Number(stmt.currentBalance);
      });
      
      const years = Object.entries(yearsData)
        .map(([year, data]) => ({
          year,
          monthsCount: data.months.size,
          balance: data.balance,
        }))
        .sort((a, b) => Number(b.year) - Number(a.year));
      
      return { account, years };
    }).filter((item) => item.years.length > 0);
  }, [accounts, statements]);

  const toggleAccount = (accountId) => {
    setExpandedAccounts((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 border-b border-indigo-700">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 shrink-0 text-white" />
              <h1 className="text-xl font-semibold text-white">Gestisci estratti conto</h1>
            </div>
            <p className="mt-1 text-sm text-indigo-100">Seleziona un conto e clicca su un anno per visualizzare i dettagli.</p>
          </div>
        </div>
      </div>

      <div className="p-3">
        {message && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}

        {loading ? (
          <p className="px-5 py-5 text-sm text-slate-500">Caricamento...</p>
        ) : accountsWithYears.length === 0 ? (
          <p className="px-5 py-5 text-sm text-slate-500">Nessun conto con dati disponibili.</p>
        ) : (
          <div className="space-y-2">
            {accountsWithYears.map(({ account, years }) => (
              <div key={account.id} className="rounded-lg border border-slate-200 overflow-hidden">
                {/* Header Account */}
                <button
                  onClick={() => toggleAccount(account.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors border-b border-slate-200"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <i
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: account.color || "#64748b" }}
                    />
                    <span className="font-semibold text-slate-900">{account.name}</span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                      {years.length} anno{years.length !== 1 ? "i" : ""}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-600 transition-transform ${
                      expandedAccounts[account.id] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Years List */}
                {expandedAccounts[account.id] && (
                  <div className="divide-y divide-slate-100">
                    {years.map((item, index) => (
                      <Link
                        key={`${account.id}-${item.year}`}
                        to={`/accounting/statements/${account.id}?year=${item.year}`}
                        className="flex items-center justify-between px-6 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-50 transition-colors group"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                            {item.year}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                              {item.monthsCount}/12 mesi
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              item.balance < 0
                                ? "text-red-600 bg-red-50 px-2 py-1 rounded"
                                : "text-emerald-600 bg-emerald-50 px-2 py-1 rounded"
                            }`}
                          >
                            {currency.format(item.balance)}
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-orange-400 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

