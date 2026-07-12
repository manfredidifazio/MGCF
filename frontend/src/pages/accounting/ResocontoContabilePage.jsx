import { ClipboardList } from "lucide-react";
import PageMask from "../../components/layout/PageMask";

export default function ResocontoContabilePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageMask icon={ClipboardList} title="Resoconto contabile" description="Visualizza il resoconto complessivo della contabilità." />
      
      <div className="px-6 pb-6">
        <div className="rounded-xl border border-gray-300 bg-white p-6">
          <p className="text-slate-600">Sezione in corso di sviluppo</p>
        </div>
      </div>
    </div>
  );
}
