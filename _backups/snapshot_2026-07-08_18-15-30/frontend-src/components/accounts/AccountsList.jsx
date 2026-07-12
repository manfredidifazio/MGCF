import {
  Archive,
  RefreshCw,
  SquarePen,
  Trash2,
} from "lucide-react";

const accountGrid = "minmax(150px, 1fr) minmax(150px, 1fr) minmax(170px, 1fr) 100px minmax(210px, 1.2fr) 92px";

export default function AccountsList({ accounts, onDelete, onEdit, onStatusChange }) {
  if (accounts.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-medium text-slate-700">Nessun conto registrato</p>
        <p className="mt-1 text-sm text-slate-500">
          Crea il primo conto per iniziare a registrare gli accrediti.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-base font-semibold text-slate-900">Conti registrati</h2>
        <p className="mt-1 text-sm text-slate-500">
          I conti archiviati restano disponibili nello storico contabile.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 900 }}>
          <div className="grid items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400" style={{ gridTemplateColumns: accountGrid }}>
            <span>Nome conto</span>
            <span>Banca</span>
            <span>IBAN</span>
            <span>Stato</span>
            <span>Note</span>
            <span className="text-right">Azioni</span>
          </div>

          <div className="divide-y divide-slate-100">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`grid items-center gap-4 px-5 py-2.5 text-[13px] ${account.active ? "" : "bg-slate-50 opacity-75"}`}
                style={{ gridTemplateColumns: accountGrid }}
              >
                <span className="flex min-w-0 items-center gap-2 font-semibold uppercase" style={{ color: account.color || "#0f172a" }}>
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: account.color || "#64748b" }} />
                  <span className="truncate">{account.name}</span>
                </span>
                <span className="truncate text-slate-500">{account.bank || "—"}</span>
                <span className="truncate text-slate-500">{account.iban || "—"}</span>
                <span className={`w-max rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${account.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                  {account.active ? "Attivo" : "Archiviato"}
                </span>
                <span className="truncate text-slate-400">{account.description || "Conto non ancora presente"}</span>
                <span className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => onEdit(account)} aria-label={`Modifica ${account.name}`} title="Modifica" className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-700">
                    <SquarePen className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onStatusChange(account)} aria-label={`${account.active ? "Archivia" : "Ripristina"} ${account.name}`} title={account.active ? "Archivia" : "Ripristina"} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800">
                    {account.active ? <Archive className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => onDelete(account)} aria-label={`Elimina ${account.name}`} title="Elimina" className="flex h-7 w-7 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50 hover:text-red-700">
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
