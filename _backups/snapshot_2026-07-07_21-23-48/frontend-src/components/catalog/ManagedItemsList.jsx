import {
  ArchiveBoxArrowDownIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const itemGrid = "minmax(170px, 1fr) minmax(260px, 1.6fr) 100px minmax(200px, 1fr) 92px";

export default function ManagedItemsList({ config, items, onDelete, onEdit, onStatusChange }) {
  if (items.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-medium text-slate-700">{config.emptyText}</p>
        <p className="mt-1 text-sm text-slate-500">Aggiungi il primo elemento per mostrarlo nella sidebar.</p>
      </div>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-base font-semibold text-slate-900">{config.registeredLabel}</h2>
        <p className="mt-1 text-sm text-slate-500">Gli elementi archiviati non vengono mostrati nella sidebar.</p>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 760 }}>
          <div className="grid items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400" style={{ gridTemplateColumns: itemGrid }}>
            <span>Nome</span>
            <span>Dettagli</span>
            <span>Stato</span>
            <span>Note</span>
            <span className="text-right">Azioni</span>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.id}
                className={`grid items-center gap-4 px-5 py-2.5 text-[13px] ${item.active ? "" : "bg-slate-50 opacity-75"}`}
                style={{ gridTemplateColumns: itemGrid }}
              >
                <span className="truncate font-semibold uppercase text-slate-900">{item.name}</span>
                <span className="truncate text-slate-500">{config.summary(item) || "Nessun dettaglio aggiuntivo"}</span>
                <span className={`w-max rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                  {item.active ? "Attivo" : "Archiviato"}
                </span>
                <span className="truncate text-slate-400">{item.notes || item.description || "—"}</span>
                <span className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => onEdit(item)} aria-label={`Modifica ${item.name}`} title="Modifica" className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-700">
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onStatusChange(item)} aria-label={`${item.active ? "Archivia" : "Ripristina"} ${item.name}`} title={item.active ? "Archivia" : "Ripristina"} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800">
                    {item.active ? <ArchiveBoxArrowDownIcon className="h-4 w-4" /> : <ArrowPathIcon className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => onDelete(item)} aria-label={`Elimina ${item.name}`} title="Elimina" className="flex h-7 w-7 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50 hover:text-red-700">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
