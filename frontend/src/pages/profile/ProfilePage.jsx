import { useState } from "react";

import PageMask from "../../components/layout/PageMask";
import { useAuth } from "../../context/AuthContext";
import { updatePassword, updateProfile } from "../../services/authService";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");

  async function saveProfile(event) {
    event.preventDefault();
    const data = await updateProfile(username);
    updateUser(data.user);
    setMessage("Profilo aggiornato.");
  }

  async function savePassword(event) {
    event.preventDefault();
    await updatePassword(passwords.currentPassword, passwords.newPassword);
    setPasswords({ currentPassword: "", newPassword: "" });
    setMessage("Password aggiornata.");
  }

  return (
    <PageMask title="Profilo" description="Gestisci le informazioni del tuo account MGCF.">
      {message && <p className="mgcf-toast mgcf-toast--success px-4 py-3 text-sm font-semibold">{message}</p>}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-lg border border-gray-300 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Nome utente</h2>
          <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-3 h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-indigo-500" />
          <p className="mt-2 text-xs text-slate-400">Email account: {user?.email}</p>
          <button className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Salva</button>
        </form>
        <form onSubmit={savePassword} className="rounded-lg border border-gray-300 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Password</h2>
          <input type="password" placeholder="Password attuale" value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} className="mt-3 h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-indigo-500" />
          <input type="password" placeholder="Nuova password" value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-indigo-500" />
          <button className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Aggiorna</button>
        </form>
      </div>
    </PageMask>
  );
}
