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
import Logo from "../ui/Logo";

const accountingItems = [
  { label: "Visualizza saldo conti", path: "/accounting/balances", icon: BarChart2 },
  { label: "Resoconto contabile", path: "/accounting/resoconto-contabile", icon: ClipboardList },
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

function TreeLink({ to, children, className = "", icon: Icon = null, label = null }) {
  const location = useLocation();
  const active = targetIsActive(to, location);
  const displayLabel = label || (typeof children === 'string' ? children : null);

  if (Icon) {
    return (
      <Link to={to} className={`${className} group flex items-center gap-2.5 px-1 py-2.5 text-[10px] uppercase tracking-wide`}>
        <Icon className="h-4 w-4 shrink-0 !text-black" />
        <span className={`whitespace-nowrap leading-4 transition-colors ${active ? "font-semibold text-orange-400" : "text-slate-600 group-hover:font-semibold"}`}>{displayLabel}</span>
      </Link>
    );
  }

  return (
    <Link to={to} className={`${className} group`}>
      <span className={`transition-colors ${active ? "font-semibold text-orange-400" : "text-slate-600 group-hover:font-semibold"}`}>{children}</span>
    </Link>
  );
}

function SidebarLink({ item, minimal = false }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => `flex items-center py-2.5 text-[10px] uppercase tracking-wide group ${minimal ? "px-3" : "gap-2.5 px-1"}`}
    >
      {!minimal && <Icon className="h-4 w-4 shrink-0 !text-black" />}
      <span className={`whitespace-nowrap leading-4 transition-colors ${isActive ? "font-semibold text-orange-400" : "text-slate-600 group-hover:font-semibold"}`}>{item.label}</span>
    </NavLink>
  );
}

function ToggleButton({ open, onToggle, label, compact = false, isHighlighted = false, onMouseEnter, onMouseLeave }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave?.();
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-expanded={open}
      aria-label={`${open ? "Nascondi" : "Mostra"} ${label}`}
      className={`flex shrink-0 items-center justify-center text-black focus-visible:outline-none ${compact ? "h-7 w-7" : "h-8 w-8"}`}
    >
      <ChevronDown 
        className={`${compact ? "h-[15px] w-[15px]" : "h-[18px] w-[18px]"} stroke-[3] font-bold !text-black transition-transform`}
        style={{
          transform: open || isHovered ? 'rotate(0deg)' : 'rotate(-90deg)',
        }}
      />
    </button>
  );
}

function MacroSection({ label, children }) {
  return (
    <section className="py-1.5">
      <div className="flex min-h-10 items-center">
        <span className="min-w-0 flex-1 px-1 py-2 text-sm uppercase tracking-[0.08em] text-slate-600">
          {label}
        </span>
      </div>
      <div>{children}</div>
    </section>
  );
}

function AccountingTreeGroup({ label, icon: Icon, open, onToggle, isActive = false, children }) {
  const [isToggleHovered, setIsToggleHovered] = useState(false);
  const isHighlighted = open;
  return (
    <div>
      <div className="flex min-h-9 items-center">
        <button
          type="button"
          onClick={onToggle}
          className={`flex min-w-0 flex-1 items-center gap-2.5 px-1 py-2.5 text-[10px] uppercase tracking-wide group ${isHighlighted ? "" : ""}`}
        >
          <Icon className="h-4 w-4 shrink-0 !text-black" />
          <span className={`whitespace-nowrap leading-4 transition-colors ${isHighlighted ? "font-semibold text-orange-400" : isToggleHovered ? "font-semibold text-slate-600" : "text-slate-600 group-hover:font-semibold"}`}>{label}</span>
        </button>
        <ToggleButton open={open} onToggle={onToggle} label={label} compact isHighlighted={isHighlighted} onMouseEnter={() => setIsToggleHovered(true)} onMouseLeave={() => setIsToggleHovered(false)} />
      </div>
      {open && <div className="pl-7">{children}</div>}
    </div>
  );
}

function AccountBranch({ account, years, type, open, onToggle, location }) {
  const [isToggleHovered, setIsToggleHovered] = useState(false);
  const isAccredits = type === "accredits";
  const prefix = isAccredits ? "Accrediti" : "Estratti";
  const isActive = isAccredits 
    ? location.search.includes(`account=${account.id}`)
    : location.pathname.includes(`/statements/${account.id}`);
  const isHighlighted = open || isActive;

  return (
    <div>
      <div className="flex min-h-8 items-center">
        <button
          type="button"
          onClick={onToggle}
          className={`flex min-w-0 flex-1 items-center gap-2 py-2 pl-1 text-[10px] uppercase tracking-wide group ${isHighlighted ? "" : ""}`}
        >
          <span className={`whitespace-nowrap leading-4 transition-colors ${isHighlighted ? "font-semibold text-orange-400" : isToggleHovered ? "font-semibold text-slate-600" : "text-slate-600 group-hover:font-semibold"}`}>{prefix} {account.name}</span>
        </button>
        <ToggleButton open={open} onToggle={onToggle} label={`${prefix} ${account.name}`} compact isHighlighted={isHighlighted} onMouseEnter={() => setIsToggleHovered(true)} onMouseLeave={() => setIsToggleHovered(false)} />
      </div>
      {open && (
        <div className="pb-1 pl-6">
          {years.map((year) => {
            const path = isAccredits
              ? `/accounting/accredits?account=${account.id}&year=${year}`
              : `/accounting/statements/${account.id}?year=${year}`;
            return <TreeLink key={year} to={path} className="block px-2 py-1.5 text-[10px] uppercase tracking-wide">Anno {year}</TreeLink>;
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const [openTrees, setOpenTrees] = useState({ accredits: false, statements: false, tax: false, property: false, vehicle: false });
  const [openAccounts, setOpenAccounts] = useState({});
  const [items, setItems] = useState({ tax: [], property: [], vehicle: [] });
  const [accountingData, setAccountingData] = useState({ accounts: [], accredits: [], statements: [] });

  // Close all menus when location changes
  useEffect(() => {
    setOpenTrees({ accredits: false, statements: false, tax: false, property: false, vehicle: false });
    setOpenAccounts({});
  }, [location.pathname]);

  // Open the correct menus based on current location
  useEffect(() => {
    if (location.pathname.startsWith("/accounting/accredits")) {
      const params = new URLSearchParams(location.search);
      const accountId = params.get("account");
      if (accountId) {
        setOpenTrees((current) => ({ ...current, accredits: true }));
        setOpenAccounts({ [`accredits-${accountId}`]: true });
      }
    } else if (location.pathname.startsWith("/accounting/statements")) {
      const match = location.pathname.match(/\/statements\/(\d+)/);
      if (match) {
        const accountId = match[1];
        setOpenTrees((current) => ({ ...current, statements: true }));
        setOpenAccounts({ [`statements-${accountId}`]: true });
      }
    } else if (location.pathname.startsWith("/taxes")) {
      setOpenTrees((current) => ({ ...current, tax: true }));
    } else if (location.pathname.startsWith("/properties")) {
      setOpenTrees((current) => ({ ...current, property: true }));
    } else if (location.pathname.startsWith("/vehicles")) {
      setOpenTrees((current) => ({ ...current, vehicle: true }));
    }
  }, [location.pathname, location.search]);

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
    <aside className="w-64 h-screen shrink-0 overflow-y-auto border-r border-gray-300 bg-white px-3 pb-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {/* Hide scrollbar with CSS */}
      <style>{`
        aside::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-center bg-white">
        <Link
          to="/dashboard"
          aria-label="Vai alla dashboard"
          title="Dashboard"
          className="flex shrink-0 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
          <Logo compact />
        </Link>
      </div>
      
      
      <div className="py-3">
        <MacroSection label="Gestione contabile">
        <AccountingTreeGroup label="Inserisci accrediti" icon={FileDown} open={openTrees.accredits} onToggle={() => toggleTree("accredits")} isActive={location.pathname.startsWith("/accounting/accredits")}>
          {accountingData.accounts.map((account) => <AccountBranch key={account.id} account={account} years={availableYears} type="accredits" open={Boolean(openAccounts[`accredits-${account.id}`])} onToggle={() => toggleAccount(`accredits-${account.id}`)} location={location} />)}
        </AccountingTreeGroup>
        <AccountingTreeGroup label="Gestisci estratti conto" icon={FileText} open={openTrees.statements} onToggle={() => toggleTree("statements")} isActive={location.pathname.startsWith("/accounting/statements")}>
          {accountingData.accounts.map((account) => <AccountBranch key={account.id} account={account} years={availableYears} type="statements" open={Boolean(openAccounts[`statements-${account.id}`])} onToggle={() => toggleAccount(`statements-${account.id}`)} location={location} />)}
        </AccountingTreeGroup>
        {accountingItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.path} className="flex min-h-9 items-center">
              <TreeLink to={item.path} icon={Icon} label={item.label} className="flex min-w-0 flex-1 items-center" />
            </div>
          );
        })}
      </MacroSection>

      <div className="my-3 border-t border-gray-300" />

      <MacroSection label="Gestione fiscale">
        {dynamicSections.map((section) => {
          const Icon = section.icon;
          const isActive = location.pathname.startsWith(section.basePath) || location.pathname.startsWith(section.settingsPath);
          return (
          <AccountingTreeGroup key={section.type} label={section.label} icon={Icon} open={openTrees[section.type]} onToggle={() => toggleTree(section.type)} isActive={isActive}>
            {items[section.type].length > 0 ? items[section.type].map((item) => (
              <TreeLink key={item.id} to={`${section.basePath}/${item.id}`} className="block px-3 py-2 text-[10px] uppercase tracking-wide">
                {item.name}
              </TreeLink>
            )) : (
              <p className="px-2 py-2 text-[11px] text-slate-500">Nessun elemento attivo</p>
            )}
          </AccountingTreeGroup>
          );
        })}
      </MacroSection>
      </div>
    </aside>
  );
}
