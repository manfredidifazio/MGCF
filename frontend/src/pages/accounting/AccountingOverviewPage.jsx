import {
  BarChart2,
  ChevronRight,
  ClipboardList,
  FileDown,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

import PageMask from "../../components/layout/PageMask";

const sections = [
  { label: "Inserisci accredito", path: "/accounting/accredits", icon: FileDown },
  { label: "Gestisci estratti conto", path: "/accounting/statements", icon: FileText },
  { label: "Visualizza saldo conti", path: "/accounting/balances", icon: BarChart2 },
  { label: "Resoconto contabile", path: "/accounting/reports", icon: ClipboardList },
];

export default function AccountingOverviewPage() {
  return (
    <PageMask title="Contabilità" description="Accedi alle quattro funzioni contabili fisse del gestionale.">
      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
        {sections.map((section) => {
          const Icon = section.icon;
          const tone = section.path.includes("accredits") ? "from-cyan-500 to-blue-500" : section.path.includes("statements") ? "from-indigo-500 to-purple-500" : section.path.includes("balances") ? "from-emerald-500 to-teal-500" : "from-orange-500 to-amber-500";
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
