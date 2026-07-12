import {
  BarChart2,
  ChevronDown,
  ClipboardList,
  FileDown,
  FileText,
  Building2,
  ReceiptText,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { getAccounts } from "../../services/accountService";
import { getAccountStatements } from "../../services/accountStatementService";
import { getAccredits } from "../../services/accreditService";
import { getManagedItems } from "../../services/managedItemService";
import { accountingYears } from "../../utils/accountingPeriods";

const accountingItems = [
  { label: "Visualizza saldi conto", path: "/accounting/balances", icon: BarChart2 },
  { label: "Resoconto contabile", path: "/accounting/reports", icon: ClipboardList },
];

const dynamicSections = [
  { type: "tax", label: "Tasse", icon: ReceiptText, basePath: "/taxes", settingsPath: "/settings/taxes" },
  { type: "property", label: "Immobili", icon: Building2, basePath: "/properties", settingsPath: "/settings/properties" },
  { type: "vehicle", label: "Veicoli", icon: Truck, basePath: "/vehicles", settingsPath: "/settings/vehicles" },
];

function normalizedSearch(value) {
  return [...new URLSearchParams(value).entries()]
    .sort(([firstKey, firstValue], [secondKey, secondValue]) => firstKey.localeCompare(secondKey) || firstValue.localeCompare(secondValue))
    .map(([key, item]) => `${key}=${item}`)
    .join("&");
}

function targetIsActive(to, location) {
  const [pathname, search = ""] = to.split("?");
  return location.pathname === pathname && normalizedSearch(location.search) === normalizedSearch(search);
}

function TreeLink({ to, children, className = "" }) {
  const location = useLocation();
  const active = targetIsActive(to, location);

  return <Link to={to} className={`${className} transition-colors hover:font-semibold hover:text-sky-600 ${active ? "font-semibold text-sky-600" : "text-slate-600"}`}>{children}</Link>;
}

function SidebarLink({ item, minimal = false }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => `flex items-center border-t border-slate-100 py-2.5 text-[10px] uppercase tracking-wide transition-colors hover:font-semibold hover:text-sky-600 ${minimal ? "px-3" : "gap-2.5 px-1"} ${isActive ? "font-semibold text-sky-600" : "text-slate-600"}`}
    >
      {!minimal && <Icon className="h-4 w-4 shrink-0 text-current" />}
      <span className="whitespace-nowrap leading-4">{item.label}</span>
    </NavLink>
  );
}

function ToggleButton({ open, onToggle, label, compact = false }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`${open ? "Nascondi" : "Mostra"} ${label}`}
      className={`flex shrink-0 items-center justify-center text-slate-500 transition-colors hover:text-sky-600 ${compact ? "h-7 w-7" : "h-8 w-8"}`}
    >
      <ChevronDown className={`${compact ? "h-[15px] w-[15px]" : "h-[18px] w-[18px]"} stroke-[2.8] transition-transform ${open ? "" : "-rotate-90"}`} />
    </button>
  );
}

function MacroSection({ label, children }) {
  return (
    <section className="border-b border-slate-300 py-1.5">
      <div className="flex min-h-10 items-center">
        <span className="min-w-0 flex-1 px-1 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-900">
          {label}
        </span>
      </div>
      <div>{children}</div>
    </section>
  );
}

function AccountingTreeGroup({ label, icon: Icon, open, onToggle, children }) {
  return (
    <div className="border-t border-slate-100">
      <div className="flex min-h-9 items-center">
        <button
          type="button"
          onClick={onToggle}
          className={`flex min-w-0 flex-1 items-center gap-2.5 px-1 py-2.5 text-[10px] uppercase tracking-wide transition-colors hover:font-semibold hover:text-sky-600 ${open ? "font-semibold text-sky-600" : "text-slate-600"}`}
        >
          <Icon className="h-4 w-4 shrink-0 text-current" />
          <span className="whitespace-nowrap leading-4">{label}</span>
        </button>
        <ToggleButton open={open} onToggle={onToggle} label={label} compact />
      </div>
      {open && <div className="pl-7">{children}</div>}
    </div>
  );
}

function AccountBranch({ account, years, type, open, onToggle }) {
  const isAccredits = type === "accredits";
  const prefix = isAccredits ? "Accrediti" : "Estratti";

  return (
    <div className="border-t border-slate-100">
      <div className="flex min-h-8 items-center">
        <button
          type="button"
          onClick={onToggle}
          className={`flex min-w-0 flex-1 items-center gap-2 py-2 pl-1 text-[10px] uppercase tracking-wide transition-colors hover:font-semibold hover:text-sky-600 ${open ? "font-semibold text-sky-600" : "text-slate-600"}`}
        >
          <span className="whitespace-nowrap leading-4">{prefix} {account.name}</span>
        </button>
        <ToggleButton open={open} onToggle={onToggle} label={`${prefix} ${account.name}`} compact />
      </div>
      {open && (
        <div className="pb-1 pl-6">
          {years.map((year) => {
            const path = isAccredits
              ? `/accounting/accredits?account=${account.id}&year=${year}`
              : `/accounting/statements/${account.id}?year=${year}`;
            return <TreeLink key={year} to={path} className="block border-t border-slate-100 px-2 py-1.5 text-[10px] uppercase tracking-wide">Anno {year}</TreeLink>;
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [openTrees, setOpenTrees] = useState({ accredits: false, statements: false, tax: false, property: false, vehicle: false });
  const [openAccounts, setOpenAccounts] = useState({});
  const [items, setItems] = useState({ tax: [], property: [], vehicle: [] });
  const [accountingData, setAccountingData] = useState({ accounts: [], accredits: [], statements: [] });

  useEffect(() => {
    let active = true;

    async function load(type) {
      try {
        const data = await getManagedItems(type);
        if (active) setItems((current) => ({ ...current, [type]: data.filter((item) => item.active) }));
      } catch {
        if (active) setItems((current) => ({ ...current, [type]: [] }));
      }
    }

    async function loadAccounting() {
      try {
        const [accounts, accredits, statements] = await Promise.all([getAccounts(), getAccredits(), getAccountStatements()]);
        if (!active) return;
        const activeAccounts = accounts.filter((account) => account.active);
        setAccountingData({ accounts: activeAccounts, accredits, statements });
      } catch {
        if (active) setAccountingData({ accounts: [], accredits: [], statements: [] });
      }
    }

    dynamicSections.forEach((section) => load(section.type));
    loadAccounting();
    const handleManagedUpdate = (event) => load(event.detail?.type);
    window.addEventListener("mgcf:managed-items-updated", handleManagedUpdate);
    window.addEventListener("mgcf:accounts-updated", loadAccounting);
    window.addEventListener("mgcf:accredits-updated", loadAccounting);
    window.addEventListener("mgcf:account-statements-updated", loadAccounting);

    return () => {
      active = false;
      window.removeEventListener("mgcf:managed-items-updated", handleManagedUpdate);
      window.removeEventListener("mgcf:accounts-updated", loadAccounting);
      window.removeEventListener("mgcf:accredits-updated", loadAccounting);
      window.removeEventListener("mgcf:account-statements-updated", loadAccounting);
    };
  }, []);

  const availableYears = useMemo(() => {
    return accountingYears(
      accountingData.accredits.map((item) => item.movementDate),
      accountingData.statements.map((item) => item.period),
    );
  }, [accountingData.accredits, accountingData.statements]);

  function toggleTree(tree) {
    setOpenTrees((current) => {
      const nextOpen = !current[tree];
      const reset = Object.keys(current).reduce((accumulator, key) => ({ ...accumulator, [key]: false }), {});
      return { ...reset, [tree]: nextOpen };
    });
    setOpenAccounts({});
  }

  function toggleAccount(key) {
    setOpenAccounts((current) => {
      const nextOpen = !current[key];
      const [branch] = key.split("-");
      const clearedBranch = Object.keys(current).reduce(
        (accumulator, currentKey) => ({ ...accumulator, [currentKey]: currentKey.startsWith(`${branch}-`) ? false : current[currentKey] }),
        {},
      );
      return { ...clearedBranch, [key]: nextOpen };
    });
  }

  return (
    <aside className="sticky top-14 h-[calc(100vh-56px)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-3 pb-5">
      <MacroSection label="Gestione contabile">
        <AccountingTreeGroup label="Inserisci accrediti" icon={FileDown} open={openTrees.accredits} onToggle={() => toggleTree("accredits")}>
          {accountingData.accounts.map((account) => <AccountBranch key={account.id} account={account} years={availableYears} type="accredits" open={Boolean(openAccounts[`accredits-${account.id}`])} onToggle={() => toggleAccount(`accredits-${account.id}`)} />)}
        </AccountingTreeGroup>
        <AccountingTreeGroup label="Gestisci estratti conto" icon={FileText} open={openTrees.statements} onToggle={() => toggleTree("statements")}>
          {accountingData.accounts.map((account) => <AccountBranch key={account.id} account={account} years={availableYears} type="statements" open={Boolean(openAccounts[`statements-${account.id}`])} onToggle={() => toggleAccount(`statements-${account.id}`)} />)}
        </AccountingTreeGroup>
        {accountingItems.map((item) => <SidebarLink key={item.path} item={item} />)}
      </MacroSection>

      <MacroSection label="Gestione fiscale">
        {dynamicSections.map((section) => {
          const Icon = section.icon;
          return (
          <AccountingTreeGroup key={section.type} label={section.label} icon={Icon} open={openTrees[section.type]} onToggle={() => toggleTree(section.type)}>
            {items[section.type].length > 0 ? items[section.type].map((item) => (
              <SidebarLink minimal key={item.id} item={{ label: item.name, path: `${section.basePath}/${item.id}`, icon: Icon }} />
            )) : (
              <p className="px-2 py-2 text-[11px] text-slate-400">Nessun elemento attivo</p>
            )}
          </AccountingTreeGroup>
          );
        })}
        <SidebarLink item={{ label: "Resoconto fiscale", path: "/fiscal/reports", icon: ReceiptText }} />
      </MacroSection>
    </aside>
  );
}
