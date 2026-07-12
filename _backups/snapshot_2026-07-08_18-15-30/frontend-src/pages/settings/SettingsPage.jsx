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
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
        {visibleSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.path} to={section.path} className="flex items-center gap-3 px-5 py-4 text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-900">
              <Icon className="h-5 w-5 shrink-0 text-slate-500" />
              <span className="flex-1 text-sm">{section.label}</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          );
        })}
      </div>
    </PageMask>
  );
}
