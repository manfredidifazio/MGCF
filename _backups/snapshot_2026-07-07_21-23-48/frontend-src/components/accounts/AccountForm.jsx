import { useState } from "react";

const emptyAccount = {
  name: "",
  bank: "",
  iban: "",
  description: "",
  color: "#f59e0b",
};

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-amber-500";

export default function AccountForm({ account, onCancel, onSave, saving }) {
  const [fields, setFields] = useState(account ?? emptyAccount);

  function updateField(name, value) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(fields);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-xl border border-slate-200 bg-white p-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {account ? "Modifica conto" : "Nuovo conto"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Inserisci le informazioni che identificheranno il conto nel gestionale.
          </p>
        </div>

        <input
          type="color"
          value={fields.color || "#f59e0b"}
          onChange={(event) => updateField("color", event.target.value)}
          aria-label="Colore del conto"
          className="h-12 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Nome del conto *
          <input
            required
            value={fields.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Es. Conto principale"
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Banca o istituto
          <input
            value={fields.bank ?? ""}
            onChange={(event) => updateField("bank", event.target.value)}
            placeholder="Es. Unicredit"
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          IBAN
          <input
            value={fields.iban ?? ""}
            onChange={(event) => updateField("iban", event.target.value)}
            placeholder="IT00 A000 0000 0000 0000 0000 000"
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          Descrizione
          <textarea
            rows="3"
            value={fields.description ?? ""}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Nota facoltativa sul conto"
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
        >
          {saving ? "Salvataggio..." : "Salva conto"}
        </button>
      </div>
    </form>
  );
}
