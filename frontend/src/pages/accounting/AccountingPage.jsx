import { BarChart, ChevronRight, ClipboardList, ReceiptText, File, Printer } from "lucide-react";
import PageMask from "../../components/layout/PageMask";

const descriptions = {
  accredits: "Registra un nuovo accredito associandolo a uno dei conti configurati.",
  statements: "Consulta e gestisci gli estratti conto.",
  balances: "Visualizza i saldi aggiornati dei conti.",
  reports: "Consulta il resoconto complessivo della contabilità.",
  fiscalReports: "Consulta il resoconto complessivo di tasse, immobili e veicoli.",
};

export default function AccountingPage({ section, title }) {
  const iconMap = {
    reports: Printer,
    fiscalReports: ReceiptText,
  };
  const icon = iconMap[section] || BarChart;

  if (section === "reports") {
    return (
      <PageMask icon={icon} title="Genera documenti di resoconto" description={descriptions[section]}>
        <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
          <button className="flex w-full items-center gap-3 px-5 py-4 text-slate-700 transition-transform hover:-translate-y-0.5 hover:bg-slate-50">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <ClipboardList className="h-5 w-5" />
            </span>
            <span className="flex-1 text-left text-sm font-medium text-slate-800">Genera PDF resoconto contabile</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
          <button className="flex w-full items-center gap-3 px-5 py-4 text-slate-700 transition-transform hover:-translate-y-0.5 hover:bg-slate-50">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
              <ReceiptText className="h-5 w-5" />
            </span>
            <span className="flex-1 text-left text-sm font-medium text-slate-800">Genera PDF resoconto fiscale</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </PageMask>
    );
  }

  return (
    <PageMask icon={icon} title={title} description={descriptions[section]}>
      <div className="rounded-xl border border-gray-300 bg-white p-8">
        <p className="text-sm text-slate-500">Sezione contabile pronta per il prossimo passaggio operativo.</p>
      </div>
    </PageMask>
  );
}
