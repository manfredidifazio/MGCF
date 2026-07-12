import { Menu } from "@headlessui/react";
import { Banknote, FileBarChart, Printer, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const reports = [
  { label: "Resoconto contabile", path: "/accounting/reports", icon: Banknote },
  { label: "Resoconto fiscale", path: "/fiscal/reports", icon: ReceiptText },
];

export default function ReportsMenu() {
  const navigate = useNavigate();

  return (
    <Menu as="div" className="relative shrink-0">
      <Menu.Button aria-label="Stampa e resoconti" title="Stampa e resoconti" className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-amber-600 transition-colors hover:border-amber-300 hover:bg-amber-50">
        <Printer className="h-[18px] w-[18px]" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-md border border-slate-200 bg-white py-1 focus:outline-none">
        <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><FileBarChart className="h-4 w-4" />Resoconti</div>
        {reports.map((report, index) => {
          const Icon = report.icon;
          return <div key={report.path}>{index > 0 && <div className="mx-3 border-t border-slate-200" />}<Menu.Item>{({ focus }) => <button type="button" onClick={() => navigate(report.path)} className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-[12px] text-slate-700 ${focus ? "bg-amber-50 text-amber-900" : ""}`}><Icon className="h-[18px] w-[18px] text-slate-500" />{report.label}</button>}</Menu.Item></div>;
        })}
      </Menu.Items>
    </Menu>
  );
}
