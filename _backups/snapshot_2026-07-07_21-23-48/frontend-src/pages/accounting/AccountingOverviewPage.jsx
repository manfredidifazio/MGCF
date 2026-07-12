import {
  ChartBarSquareIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

import PageMask from "../../components/layout/PageMask";

const sections = [
  { label: "Inserisci accredito", path: "/accounting/accredits", icon: DocumentArrowDownIcon },
  { label: "Gestisci estratti conto", path: "/accounting/statements", icon: DocumentTextIcon },
  { label: "Visualizza saldi conto", path: "/accounting/balances", icon: ChartBarSquareIcon },
  { label: "Resoconto contabile", path: "/accounting/reports", icon: ClipboardDocumentListIcon },
];

export default function AccountingOverviewPage() {
  return (
    <PageMask title="Contabilità" description="Accedi alle quattro funzioni contabili fisse del gestionale.">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.path} to={section.path} className="flex items-center gap-3 px-5 py-4 text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-900">
              <Icon className="h-5 w-5 shrink-0 text-slate-500" />
              <span className="flex-1 text-sm">{section.label}</span>
              <ChevronRightIcon className="h-4 w-4 text-slate-400" />
            </Link>
          );
        })}
      </div>
    </PageMask>
  );
}
