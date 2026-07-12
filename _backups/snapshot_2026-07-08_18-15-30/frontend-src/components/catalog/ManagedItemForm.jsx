import { useState } from "react";

const inputClass =
  "mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition-colors focus:border-amber-500";

function initialFields(config, item) {
  return Object.fromEntries(
    config.fields.map((field) => [
      field.name,
      item?.[field.name] ?? field.defaultValue ?? "",
    ])
  );
}

export default function ManagedItemForm({ config, item, onCancel, onSave, saving }) {
  const [fields, setFields] = useState(() => initialFields(config, item));

  function updateField(name, value) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(fields);
      }}
      className="mt-8 rounded-lg border border-slate-200 bg-white p-8"
    >
      <h2 className="text-xl font-semibold text-slate-900">
        {item ? `Modifica ${config.singular}` : `Nuova ${config.singular}`}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        I dati salvati aggiornano automaticamente la sezione {config.plural} nella sidebar.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {config.fields.map((field) => (
          <label
            key={field.name}
            className={`text-sm font-medium text-slate-700 ${field.full ? "md:col-span-2" : ""}`}
          >
            {field.label}{field.required ? " *" : ""}
            {field.type === "select" ? (
              <select
                required={field.required}
                value={fields[field.name]}
                onChange={(event) => updateField(field.name, event.target.value)}
                className={inputClass}
              >
                {field.options.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                rows="3"
                required={field.required}
                value={fields[field.name]}
                onChange={(event) => updateField(field.name, event.target.value)}
                placeholder={field.placeholder}
                className={inputClass}
              />
            ) : (
              <input
                type={field.type ?? "text"}
                required={field.required}
                min={field.min}
                max={field.max}
                value={fields[field.name]}
                onChange={(event) => updateField(field.name, event.target.value)}
                placeholder={field.placeholder}
                className={inputClass}
              />
            )}
          </label>
        ))}
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-amber-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
        >
          {saving ? "Salvataggio..." : "Salva"}
        </button>
      </div>
    </form>
  );
}
