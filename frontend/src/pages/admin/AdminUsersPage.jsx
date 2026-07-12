import { useEffect, useState } from "react";

import PageMask from "../../components/layout/PageMask";
import { deleteAdminUser, getAdminUsers, updateAdminUser } from "../../services/adminUserService";

const userGrid = "1.25fr 125px 130px 125px 125px 95px 300px";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [pendingEdit, setPendingEdit] = useState(null);
  const [editName, setEditName] = useState("");
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [notice, setNotice] = useState("");

  async function loadUsers(value = search) {
    setUsers(await getAdminUsers(value));
  }

  useEffect(() => {
    getAdminUsers("").then(setUsers);
  }, []);

  async function patch(user, fields) {
    await updateAdminUser(user.id, { ...user, ...fields });
    setNotice("");
    await loadUsers();
  }

  function openEdit(user) {
    setPendingEdit(user);
    setEditName(user.username || "");
  }

  async function saveEdit() {
    if (!pendingEdit || !editName.trim()) return;
    await patch(pendingEdit, { username: editName.trim() });
    setPendingEdit(null);
    setEditName("");
    setNotice("Utente modificato.");
  }

  async function toggleStatus() {
    if (!pendingStatus) return;
    await patch(pendingStatus, { isActive: !pendingStatus.isActive });
    setNotice(pendingStatus.isActive ? "Utente sospeso." : "Utente riattivato.");
    setPendingStatus(null);
  }

  async function remove() {
    if (!pendingDelete) return;
    try {
      await deleteAdminUser(pendingDelete.id);
      setNotice("Utente eliminato definitivamente.");
      setPendingDelete(null);
      await loadUsers();
    } catch (error) {
      setNotice(error.response?.data?.message || "Impossibile eliminare l'utente.");
      setPendingDelete(null);
    }
  }

  return (
    <PageMask title="Amministrazione utenti" description="Gestisci gli utenti registrati e abilita solo quelli approvati.">
      {notice && (
        <div className="mb-3 rounded-md border border-gray-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {notice}
        </div>
      )}

      <div className="mb-3 flex gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cerca utente..."
          className="h-9 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-indigo-500"
        />
        <button type="button" onClick={() => loadUsers()} className="rounded-md border border-gray-300 px-4 text-sm">
          Cerca
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
        <div style={{ minWidth: 1120 }}>
          <div
            className="grid gap-4 border-b border-gray-300 bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
            style={{ gridTemplateColumns: userGrid }}
          >
            <span>Nome utente</span>
            <span>Ruolo</span>
            <span>Registrazione</span>
            <span>Ultimo accesso</span>
            <span>Stato</span>
            <span>Movimenti</span>
            <span className="text-right">Azioni</span>
          </div>

          <div className="divide-y divide-slate-100">
            {users.map((user) => (
              <div
                key={user.id}
                className={`grid items-center gap-4 px-5 py-2.5 text-[13px] ${user.isMasterAdmin ? "bg-amber-50/60" : ""}`}
                style={{ gridTemplateColumns: userGrid }}
              >
                <span className="truncate font-semibold">{user.username}</span>
                <span className={user.isMasterAdmin ? "text-amber-700" : "text-slate-700"}>{user.role}</span>
                <span className="text-slate-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("it-IT") : "-"}</span>
                <span className="text-slate-500">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("it-IT") : "-"}</span>
                <span className={user.isActive ? "text-emerald-700" : "text-red-600"}>
                  {user.isActive ? "Attivo" : "Sospeso"}
                </span>
                <span className="text-slate-500">{Number(user.totalDataCount || 0)}</span>
                <span className="flex justify-end gap-2">
                  {!user.isMasterAdmin && !user.isVerified && (
                    <ActionButton onClick={() => patch(user, { isVerified: true })} tone="green">
                      Conferma
                    </ActionButton>
                  )}
                  <ActionButton onClick={() => openEdit(user)}>Modifica</ActionButton>
                  {!user.isMasterAdmin && (
                    <>
                      <ActionButton onClick={() => setPendingStatus(user)} tone={user.isActive ? "amber" : "green"}>
                        {user.isActive ? "Sospendi" : "Riattiva"}
                      </ActionButton>
                      <ActionButton onClick={() => setPendingDelete(user)} tone="red">
                        Elimina
                      </ActionButton>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pendingEdit && (
        <Modal title="Modificare utente?">
          <p className="text-sm text-slate-600">Puoi modificare il nome visualizzato dell'utente.</p>
          <input
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            className="mt-3 h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-indigo-500"
          />
          <ModalActions
            cancelLabel="Annulla"
            confirmLabel="Salva modifica"
            onCancel={() => setPendingEdit(null)}
            onConfirm={saveEdit}
          />
        </Modal>
      )}

      {pendingStatus && (
        <Modal title={pendingStatus.isActive ? "Sospendere utente?" : "Riattivare utente?"}>
          <p className="text-sm leading-6 text-slate-600">
            {pendingStatus.isActive ? "L'utente non potrà accedere finché resta sospeso." : "L'utente potrà accedere nuovamente al gestionale."}
          </p>
          <p className="mt-2 font-semibold text-slate-900">{pendingStatus.username}</p>
          <ModalActions
            cancelLabel="Annulla"
            confirmLabel={pendingStatus.isActive ? "Sospendi" : "Riattiva"}
            danger={pendingStatus.isActive}
            onCancel={() => setPendingStatus(null)}
            onConfirm={toggleStatus}
          />
        </Modal>
      )}

      {pendingDelete && (
        <Modal title="Eliminare utente?">
          <p className="text-sm leading-6 text-slate-600">
            Stai per eliminare definitivamente <span className="font-semibold text-slate-900">{pendingDelete.username}</span>.
          </p>
          {Number(pendingDelete.totalDataCount || 0) > 0 ? (
            <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Questo profilo ha {Number(pendingDelete.totalDataCount || 0)} movimenti/dati collegati. Eliminando l'utente verranno cancellati anche quelli.
            </p>
          ) : (
            <p className="mt-2 rounded-md border border-gray-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Questo profilo non ha movimenti o dati collegati.
            </p>
          )}
          <ModalActions
            cancelLabel="Annulla"
            confirmLabel="Elimina definitivamente"
            danger
            onCancel={() => setPendingDelete(null)}
            onConfirm={remove}
          />
        </Modal>
      )}
    </PageMask>
  );
}

function ActionButton({ children, onClick, tone = "slate" }) {
  const tones = {
    slate: "border-slate-300 text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    red: "border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button type="button" onClick={onClick} className={`rounded-md border px-2.5 py-1 text-[12px] transition-colors ${tones[tone]}`}>
      {children}
    </button>
  );
}

function Modal({ title, children }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/20 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-300 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ cancelLabel, confirmLabel, danger = false, onCancel, onConfirm }) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700">
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${danger ? "bg-red-600" : "bg-amber-500"}`}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
