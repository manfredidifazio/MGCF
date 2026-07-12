import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getAccounts } from "../../services/accountService";
import { getManagedItems } from "../../services/managedItemService";

const pages = [
  {
    label: "Dashboard",
    path: "/dashboard",
    keywords: "home dashboard panoramica principale riepilogo",
  },
  {
    label: "Impostazioni",
    path: "/settings",
    keywords: "impostazioni configurazione gestione preferenze",
  },
  {
    label: "Gestisci conti",
    path: "/settings/accounts",
    keywords: "conti conto banca bancario saldo accrediti",
  },
  {
    label: "Sicurezza",
    path: "/security",
    keywords: "sicurezza password parola ordine accesso domande recupero",
  },
  { label: "Gestisci tasse", path: "/settings/taxes", keywords: "tasse tributi imposte scadenze" },
  { label: "Gestisci immobili", path: "/settings/properties", keywords: "immobili case indirizzi catasto" },
  { label: "Gestisci veicoli", path: "/settings/vehicles", keywords: "veicoli auto targhe mezzi" },
  { label: "Gestisci causali", path: "/settings/causes", keywords: "causali accrediti descrizioni" },
  { label: "Contabilità", path: "/accounting", keywords: "contabilita movimenti gestione" },
  { label: "Inserisci accredito", path: "/accounting/accredits", keywords: "contabilita accredito entrata" },
  { label: "Gestisci estratti conto", path: "/accounting/statements", keywords: "contabilita inserisci modifica estratti conto saldi" },
  { label: "Visualizza saldi conto", path: "/accounting/balances", keywords: "contabilita saldi conto" },
  { label: "Resoconto contabile", path: "/accounting/resoconto-contabile", keywords: "contabilita resoconto report" },
  { label: "Resoconto fiscale", path: "/fiscal/reports", keywords: "fiscale tasse immobili veicoli resoconto report" },
];

const breadcrumbMap = {
  "/dashboard": [{ label: "Dashboard", path: "/dashboard" }],
  "/security": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Sicurezza", path: "/security" },
  ],
  "/settings": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Impostazioni", path: "/settings" },
  ],
  "/settings/accounts": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Impostazioni", path: "/settings" },
    { label: "Gestisci conti", path: "/settings/accounts" },
  ],
  "/settings/taxes": [{ label: "Dashboard", path: "/dashboard" }, { label: "Impostazioni", path: "/settings" }, { label: "Gestisci tasse", path: "/settings/taxes" }],
  "/settings/properties": [{ label: "Dashboard", path: "/dashboard" }, { label: "Impostazioni", path: "/settings" }, { label: "Gestisci immobili", path: "/settings/properties" }],
  "/settings/vehicles": [{ label: "Dashboard", path: "/dashboard" }, { label: "Impostazioni", path: "/settings" }, { label: "Gestisci veicoli", path: "/settings/vehicles" }],
  "/settings/causes": [{ label: "Dashboard", path: "/dashboard" }, { label: "Impostazioni", path: "/settings" }, { label: "Gestisci causali", path: "/settings/causes" }],
  "/accounting": [{ label: "Dashboard", path: "/dashboard" }, { label: "Contabilità", path: "/accounting" }],
  "/accounting/accredits": [{ label: "Dashboard", path: "/dashboard" }, { label: "Contabilità", path: "/accounting" }, { label: "Inserisci accredito", path: "/accounting/accredits" }],
  "/accounting/statements": [{ label: "Dashboard", path: "/dashboard" }, { label: "Contabilità", path: "/accounting" }, { label: "Gestisci estratti conto", path: "/accounting/statements" }],
  "/accounting/balances": [{ label: "Dashboard", path: "/dashboard" }, { label: "Contabilità", path: "/accounting" }, { label: "Visualizza saldi conto", path: "/accounting/balances" }],
  "/accounting/resoconto-contabile": [{ label: "Dashboard", path: "/dashboard" }, { label: "Contabilità", path: "/accounting" }, { label: "Resoconto contabile", path: "/accounting/resoconto-contabile" }],
  "/fiscal/reports": [{ label: "Dashboard", path: "/dashboard" }, { label: "Resoconto fiscale", path: "/fiscal/reports" }],
};

function managedRoute(pathname) {
  const match = pathname.match(/^\/(taxes|properties|vehicles)\/(\d+)$/);
  if (!match) return null;
  const definitions = {
    taxes: { type: "tax", section: "Gestisci tasse", settingsPath: "/settings/taxes", fallback: "Tassa" },
    properties: { type: "property", section: "Gestisci immobili", settingsPath: "/settings/properties", fallback: "Immobile" },
    vehicles: { type: "vehicle", section: "Gestisci veicoli", settingsPath: "/settings/vehicles", fallback: "Veicolo" },
  };
  return { ...definitions[match[1]], id: match[2] };
}

function statementAccountRoute(pathname) {
  const match = pathname.match(/^\/accounting\/statements\/(\d+)$/);
  return match ? { id: match[1], fallback: "Conto" } : null;
}

function breadcrumbsFor(pathname, detailName) {
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];
  const route = managedRoute(pathname);
  if (route) {
    return [
      { label: "Dashboard", path: "/dashboard" },
      { label: route.section, path: route.settingsPath },
      { label: detailName || route.fallback, path: pathname },
    ];
  }
  const accountRoute = statementAccountRoute(pathname);
  if (accountRoute) {
    return [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Contabilità", path: "/accounting" },
      { label: "Gestisci estratti conto", path: "/accounting/statements" },
      { label: detailName || accountRoute.fallback, path: pathname },
    ];
  }
  return [{ label: "Dashboard", path: "/dashboard" }];
}

function normalize(value) {
  return value
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function capitalizeFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function NavigationTrail({ className = "" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [detail, setDetail] = useState({ pathname: "", name: "" });

  useEffect(() => {
    const route = managedRoute(location.pathname);
    const accountRoute = statementAccountRoute(location.pathname);
    const searchParams = new URLSearchParams(location.search);
    const creditAccountId = location.pathname === "/accounting/accredits" ? searchParams.get("account") : null;
    
    if (!route && !accountRoute && !creditAccountId) return undefined;
    
    let active = true;
    const request = route ? getManagedItems(route.type) : getAccounts();
    
    request
      .then((items) => {
        let detailName;
        if (creditAccountId) {
          const account = items.find((entry) => String(entry.id) === creditAccountId);
          detailName = account?.name ?? "Conto";
        } else {
          const detailRoute = route ?? accountRoute;
          const item = items.find((entry) => String(entry.id) === detailRoute.id);
          detailName = item?.name ?? detailRoute.fallback;
        }
        if (active) setDetail({ pathname: location.pathname, name: detailName });
      })
      .catch(() => {
        if (creditAccountId) {
          if (active) setDetail({ pathname: location.pathname, name: "Conto" });
        } else {
          const detailRoute = route ?? accountRoute;
          if (active) setDetail({ pathname: location.pathname, name: detailRoute.fallback });
        }
      });
    return () => {
      active = false;
    };
  }, [location.pathname, location.search]);

  const detailName = detail.pathname === location.pathname ? detail.name : "";
  const searchParams = new URLSearchParams(location.search);
  const creditAccountId = location.pathname === "/accounting/accredits" ? searchParams.get("account") : null;
  const year = searchParams.get("year");
  
  let breadcrumbs = breadcrumbsFor(location.pathname, detailName);
  const isStatementPage = location.pathname.startsWith("/accounting/statements");
  const isAccreditPage = location.pathname === "/accounting/accredits";
  const isReportPage = location.pathname === "/accounting/resoconto-contabile";
  const reportView = searchParams.get("view");
  
  if (creditAccountId && isAccreditPage) {
    breadcrumbs = [
      { label: "Home", path: "/dashboard" },
      { label: "Contabilità", path: "/accounting" },
      { label: "Inserisci accredito", path: "/accounting/accredits" },
      { label: detailName, path: location.pathname + location.search },
    ];
    if (year) {
      breadcrumbs.push({ label: `Anno ${year}`, path: null });
    }
  } else if (isStatementPage && year) {
    breadcrumbs = [
      { label: "Home", path: "/dashboard" },
      { label: "Contabilità", path: "/accounting" },
      { label: "Gestisci estratti conto", path: "/accounting/statements" },
      { label: detailName || "Conto", path: null },
      { label: `Anno ${year}`, path: null },
    ];
  } else if (isAccreditPage && year) {
    breadcrumbs = [
      { label: "Home", path: "/dashboard" },
      { label: "Contabilità", path: "/accounting" },
      { label: "Inserisci accredito", path: "/accounting/accredits" },
      { label: `Anno ${year}`, path: null },
    ];
  } else if (isReportPage && reportView === "year" && year) {
    breadcrumbs = [
      { label: "Home", path: "/dashboard" },
      { label: "Contabilità", path: "/accounting" },
      { label: "Resoconto contabile", path: "/accounting/resoconto-contabile?view=general" },
      { label: `Anno ${year}`, path: null },
    ];
  }

  return (
    <div className={`flex h-8 flex-1 items-center rounded-md bg-white border border-gray-300 px-2 gap-2 ${className}`}>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Pagina precedente"
          title="Indietro"
          className="flex h-6 w-6 items-center justify-center rounded text-slate-600 transition-colors hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => navigate(1)}
          aria-label="Pagina successiva"
          title="Avanti"
          className="flex h-6 w-6 items-center justify-center rounded text-slate-600 transition-colors hover:text-orange-600"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <nav aria-label="Percorso pagina" className="ml-1 flex flex-1 items-center gap-2 text-[13px] text-slate-600 overflow-x-auto">
        {breadcrumbs.map((item, index) => (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5 shrink-0">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
            {item.path ? (
              <button
                type="button"
                onClick={() => navigate(item.path)}
                aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
                className="truncate transition-colors hover:text-orange-600"
              >
                {capitalizeFirst(item.label)}
              </button>
            ) : (
              <span className="truncate">
                {capitalizeFirst(item.label)}
              </span>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}

export function PageSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [dynamicPages, setDynamicPages] = useState([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const definitions = [
          ["tax", "/taxes"],
          ["property", "/properties"],
          ["vehicle", "/vehicles"],
        ];
        const [groups, accounts] = await Promise.all([
          Promise.all(definitions.map(([type]) => getManagedItems(type))),
          getAccounts(),
        ]);
        if (active) {
          const managedPages = groups.flatMap((items, index) => items.filter((item) => item.active).map((item) => ({ label: item.name, path: `${definitions[index][1]}/${item.id}`, keywords: item.name })));
          const accountPages = accounts.filter((account) => account.active).map((account) => ({
            label: `Estratti conto ${account.name}`,
            path: `/accounting/statements/${account.id}`,
            keywords: `${account.name} conto estratti saldi mesi`,
          }));
          setDynamicPages([...managedPages, ...accountPages]);
        }
      } catch {
        if (active) setDynamicPages([]);
      }
    }
    load();
    window.addEventListener("mgcf:managed-items-updated", load);
    return () => {
      active = false;
      window.removeEventListener("mgcf:managed-items-updated", load);
    };
  }, []);

  const results = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);

    if (terms.length === 0) return [];

    return [...pages, ...dynamicPages].filter((page) => {
      const searchable = normalize(`${page.label} ${page.keywords}`);
      return terms.every((term) => searchable.includes(term));
    });
  }, [dynamicPages, query]);

  function openPage(page) {
    navigate(page.path);
    setQuery("");
    setSearchFocused(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (results[0]) openPage(results[0]);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-56 shrink-0">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        placeholder="Cerca una pagina..."
        aria-label="Cerca una pagina"
        className="h-8 w-full rounded-md border border-cyan-400 bg-white/20 pl-8 pr-3 text-[12px] text-white outline-none transition-colors placeholder:text-white/80 focus:border-cyan-300 focus:bg-white/30 backdrop-blur-md"
      />

      {searchFocused && query.trim() && (
        <div className="absolute right-0 top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-gray-300 bg-white py-1">
          {results.length > 0 ? (
            results.map((page) => (
              <button
                key={page.path}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => openPage(page)}
                className="flex w-full items-center px-3 py-2 text-left text-[12px] text-slate-700 transition-colors hover:bg-orange-100 hover:text-orange-900"
              >
                {page.label}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-[12px] text-slate-400">Nessuna pagina trovata</p>
          )}
        </div>
      )}
    </form>
  );
}
