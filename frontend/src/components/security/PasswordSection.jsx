import { useState } from "react";

import { updatePassword } from "../../services/securityService";

export default function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage({ text: "", error: false });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({
        text: "Compila tutti i campi della parola d'ordine.",
        error: true,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        text: "La nuova parola d'ordine e la conferma non coincidono.",
        error: true,
      });
      return;
    }

    setSaving(true);

    try {
      const data = await updatePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({
        text: data.message ?? "Parola d'ordine aggiornata correttamente.",
        error: false,
      });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message ?? "Errore durante l'aggiornamento.",
        error: true,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-10 rounded-lg border border-gray-300 bg-white p-8">
      <h2 className="text-xl font-semibold text-slate-900">
        Cambio parola d'ordine
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mt-8 grid grid-cols-1 gap-6">
          <label className="text-sm font-medium text-slate-700">
            Parola d'ordine attuale
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Nuova parola d'ordine
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Conferma nuova parola d'ordine
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>
        </div>

        {message.text && (
          <p
            aria-live="polite"
            className={`mgcf-toast px-4 py-3 text-sm font-semibold ${message.error ? "mgcf-toast--error" : "mgcf-toast--success"}`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-8 rounded-md bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Aggiornamento..." : "Aggiorna parola d'ordine"}
        </button>
      </form>
    </section>
  );
}
