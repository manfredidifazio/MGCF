import { AlertTriangle } from "lucide-react";

export default function DeleteManagedItemDialog({ config, item, deleting, onCancel, onConfirm }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-6">
      <div className="w-full max-w-md rounded-lg border border-gray-300 bg-white p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-red-50">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-900">Eliminare {config.article}?</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Stai per eliminare definitivamente <strong>{item.name}</strong>. Questa operazione non può essere annullata.
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={deleting} className="rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60">Annulla</button>
          <button type="button" onClick={onConfirm} disabled={deleting} className="rounded-md bg-red-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60">
            {deleting ? "Eliminazione..." : "Elimina definitivamente"}
          </button>
        </div>
      </div>
    </div>
  );
}
