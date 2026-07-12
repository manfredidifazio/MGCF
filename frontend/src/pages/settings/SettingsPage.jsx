import {
  AlignLeft,
  Landmark,
  ChevronRight,
  Settings,
  Building2,
  ReceiptText,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageMask from "../../components/layout/PageMask";
import { useAuth } from "../../context/AuthContext";

const sections = [
  { label: "Gestisci conti", path: "/settings/accounts", icon: Landmark },
  { label: "Gestisci tasse", path: "/settings/taxes", icon: ReceiptText },
  { label: "Gestisci immobili", path: "/settings/properties", icon: Building2 },
  { label: "Gestisci veicoli", path: "/settings/vehicles", icon: Truck },
  { label: "Gestisci causali", path: "/settings/causes", icon: AlignLeft },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdministrator = String(user?.role || "").toLowerCase() === "administrator";
  const visibleSections = isAdministrator
    ? [...sections, { label: "Gestisci utenti", path: "/admin/users", icon: Settings }]
    : sections;
  return (
    <PageMask icon={Settings} title="Impostazioni" description="Accedi alle sezioni di configurazione del gestionale.">
      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
        {visibleSections.map((section) => {
          const Icon = section.icon;
          const tone = section.path.includes("accounts") ? "from-cyan-500 to-blue-500" : section.path.includes("taxes") ? "from-orange-500 to-amber-500" : section.path.includes("properties") ? "from-emerald-500 to-teal-500" : section.path.includes("vehicles") ? "from-purple-500 to-fuchsia-500" : "from-indigo-500 to-purple-500";
          return (
            <Link key={section.path} to={section.path} className="flex items-center gap-3 px-5 py-4 text-slate-700 transition-transform hover:-translate-y-0.5 hover:bg-slate-50">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tone} text-white`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1 text-sm font-medium text-slate-800">{section.label}</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          );
        })}
      </div>
    </PageMask>
  );
}
