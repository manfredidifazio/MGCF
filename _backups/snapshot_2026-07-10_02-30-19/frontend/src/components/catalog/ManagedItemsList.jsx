import {
  Archive,
  RefreshCw,
  SquarePen,
  Trash2,
  GripVertical,
} from "lucide-react";
import { useState } from "react";

const itemGrid = "40px minmax(170px, 1fr) minmax(260px, 1.6fr) 100px minmax(200px, 1fr) 92px";

export default function ManagedItemsList({ config, items, onDelete, onEdit, onStatusChange, onReorder }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e, id) => {
    if (draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    setDragOverId(null);

    if (draggedId === targetId || !draggedId) return;

    const draggedIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Creare un nuovo array riordinato
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    // Aggiornare gli indici displayOrder
    const activeItems = newItems.filter((item) => item.active);
    const archivedItems = newItems.filter((item) => !item.active);

    const reorderedItems = [
      ...activeItems.map((item, index) => ({ ...item, displayOrder: index })),
      ...archivedItems.map((item, index) => ({ ...item, displayOrder: activeItems.length + index })),
    ];

    // Estrarre solo gli ID e displayOrder per il server
    const updateData = reorderedItems.map((item) => ({
      id: item.id,
      displayOrder: item.displayOrder,
    }));

    onReorder(updateData);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };
  if (items.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-medium text-slate-700">{config.emptyText}</p>
        <p className="mt-1 text-sm text-slate-500">Aggiungi il primo elemento per mostrarlo nella sidebar.</p>
      </div>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
        <h2 className="text-base font-semibold text-slate-900">{config.registeredLabel}</h2>
        <p className="mt-1 text-sm text-slate-500">Trascina gli elementi per riordinarli. Gli elementi archiviati non vengono mostrati nella sidebar.</p>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 800 }}>
          <div className="grid items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400" style={{ gridTemplateColumns: itemGrid }}>
            <span></span>
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
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, item.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
                className={`grid items-center gap-4 px-5 py-2.5 text-[13px] cursor-move transition-colors ${
                  draggedId === item.id
                    ? "bg-orange-50 opacity-50"
                    : dragOverId === item.id
                      ? "bg-orange-100"
                      : item.active
                        ? ""
                        : "bg-slate-50 opacity-75"
                }`}
                style={{ gridTemplateColumns: itemGrid }}
              >
                <div className="flex items-center justify-center text-slate-400 hover:text-slate-600">
                  <GripVertical className="h-4 w-4" />
                </div>
                <span className="truncate font-semibold uppercase text-slate-900">{item.name}</span>
                <span className="truncate text-slate-500">{config.summary(item) || "Nessun dettaglio aggiuntivo"}</span>
                <span className={`w-max rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                  {item.active ? "Attivo" : "Archiviato"}
                </span>
                <span className="truncate text-slate-400">{item.notes || item.description || "—"}</span>
                <span className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => onEdit(item)} aria-label={`Modifica ${item.name}`} title="Modifica" className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-orange-50 hover:text-orange-700">
                    <SquarePen className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onStatusChange(item)} aria-label={`${item.active ? "Archivia" : "Ripristina"} ${item.name}`} title={item.active ? "Archivia" : "Ripristina"} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800">
                    {item.active ? <Archive className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => onDelete(item)} aria-label={`Elimina ${item.name}`} title="Elimina" className="flex h-7 w-7 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
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
