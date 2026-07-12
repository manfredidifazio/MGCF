import { BarChart2, FileDown, Settings, User, Home } from "lucide-react";
import { Link } from "react-router-dom";

import PageMask from "../../components/layout/PageMask";
import { useAuth } from "../../context/AuthContext";

const shortcuts = [
  { label: "Accrediti", description: "Inserisci e controlla i movimenti", path: "/accounting/accredits", icon: FileDown, tone: "from-cyan-500 to-blue-500" },
  { label: "Estratti conto", description: "Gestisci i saldi mensili", path: "/accounting/statements", icon: BarChart2, tone: "from-indigo-500 to-purple-500" },
  { label: "Impostazioni", description: "Configura il gestionale", path: "/settings", icon: Settings, tone: "from-orange-500 to-amber-500" },
  { label: "Profilo", description: "Dati e sicurezza account", path: "/profile", icon: User, tone: "from-emerald-500 to-teal-500" },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <PageMask icon={Home} title="Dashboard Modulo gestionale contabile fiscale" description={user?.username || "Utente"}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;

          return (
            <Link
              key={shortcut.path}
              to={shortcut.path}
              className="group rounded-xl border border-gray-300 bg-white p-4 transition-transform hover:-translate-y-0.5"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${shortcut.tone} text-white`}>
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-slate-900">{shortcut.label}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">{shortcut.description}</p>
            </Link>
          );
        })}
      </div>
    </PageMask>
  );
}
