import { useEffect, useState } from "react";

import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
  updateAccountStatus,
} from "../../services/accountService";

function sortAccounts(accounts) {
  return [...accounts].sort(
    (first, second) =>
      Number(second.active) - Number(first.active) ||
      first.name.localeCompare(second.name, "it")
  );
}

function errorMessage(error, fallback) {
  return error.response?.data?.message ?? fallback;
}

export default function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch((error) =>
        setMessage({
          text: errorMessage(error, "Impossibile caricare i conti."),
          error: true,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  function openNewAccount() {
    setEditingAccount(null);
    setFormOpen(true);
    setMessage({ text: "", error: false });
  }

  function openEditAccount(account) {
    setEditingAccount(account);
    setFormOpen(true);
    setMessage({ text: "", error: false });
  }

  async function saveAccount(fields) {
    setSaving(true);
    setMessage({ text: "", error: false });

    try {
      const saved = editingAccount
        ? await updateAccount(editingAccount.id, fields)
        : await createAccount(fields);

      setAccounts((current) => {
        const next = editingAccount
          ? current.map((account) => (account.id === saved.id ? saved : account))
          : [...current, saved];
        return sortAccounts(next);
      });
      setFormOpen(false);
      setEditingAccount(null);
      setMessage({ text: "Conto salvato correttamente.", error: false });
    } catch (error) {
      setMessage({
        text: errorMessage(error, "Errore durante il salvataggio."),
        error: true,
      });
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(account) {
    setMessage({ text: "", error: false });

    try {
      const updated = await updateAccountStatus(account.id, !account.active);
      setAccounts((current) =>
        sortAccounts(
          current.map((item) => (item.id === updated.id ? updated : item))
        )
      );
      setMessage({
        text: updated.active ? "Conto ripristinato." : "Conto archiviato.",
        error: false,
      });
    } catch (error) {
      setMessage({
        text: errorMessage(error, "Impossibile aggiornare il conto."),
        error: true,
      });
    }
  }

  async function confirmDelete() {
    setSaving(true);
    setMessage({ text: "", error: false });

    try {
      await deleteAccount(deletingAccount.id);
      setAccounts((current) =>
        current.filter((account) => account.id !== deletingAccount.id)
      );
      setMessage({ text: "Conto eliminato definitivamente.", error: false });
    } catch (error) {
      setMessage({
        text: errorMessage(error, "Impossibile eliminare il conto."),
        error: true,
      });
    } finally {
      setDeletingAccount(null);
      setSaving(false);
    }
  }

  return {
    accounts,
    changeStatus,
    confirmDelete,
    deletingAccount,
    editingAccount,
    formOpen,
    loading,
    message,
    openEditAccount,
    openNewAccount,
    saveAccount,
    saving,
    setDeletingAccount,
    setFormOpen,
  };
}
