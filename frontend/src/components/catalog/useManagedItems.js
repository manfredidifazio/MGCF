import { useEffect, useState } from "react";

import {
  createManagedItem,
  deleteManagedItem,
  getManagedItems,
  updateManagedItem,
  updateManagedItemStatus,
  reorderManagedItems,
} from "../../services/managedItemService";

function sortItems(items) {
  return [...items].sort((first, second) => {
    // Prima, ordina per active (attivi prima)
    const activeSort = Number(second.active) - Number(first.active);
    if (activeSort !== 0) return activeSort;
    
    // Poi ordina per displayOrder ASC (ordine personalizzato)
    return (first.displayOrder ?? 0) - (second.displayOrder ?? 0);
  });
}

function errorMessage(error, fallback) {
  return error.response?.data?.message ?? fallback;
}

export default function useManagedItems(type) {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  useEffect(() => {
    getManagedItems(type)
      .then((data) => setItems(sortItems(data)))
      .catch((error) => setMessage({ text: errorMessage(error, "Impossibile caricare gli elementi."), error: true }))
      .finally(() => setLoading(false));
  }, [type]);

  function openNewItem() {
    setEditingItem(null);
    setFormOpen(true);
    setMessage({ text: "", error: false });
  }

  function openEditItem(item) {
    setEditingItem(item);
    setFormOpen(true);
    setMessage({ text: "", error: false });
  }

  async function saveItem(fields) {
    setSaving(true);
    setMessage({ text: "", error: false });
    try {
      const saved = editingItem
        ? await updateManagedItem(type, editingItem.id, fields)
        : await createManagedItem(type, fields);
      setItems((current) => sortItems(
        editingItem
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved]
      ));
      setFormOpen(false);
      setEditingItem(null);
      setMessage({ text: "Elemento salvato correttamente.", error: false });
    } catch (error) {
      setMessage({ text: errorMessage(error, "Errore durante il salvataggio."), error: true });
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(item) {
    try {
      const updated = await updateManagedItemStatus(type, item.id, !item.active);
      setItems((current) => sortItems(current.map((entry) => (entry.id === updated.id ? updated : entry))));
      setMessage({ text: updated.active ? "Elemento ripristinato." : "Elemento archiviato.", error: false });
    } catch (error) {
      setMessage({ text: errorMessage(error, "Impossibile aggiornare l'elemento."), error: true });
    }
  }

  async function confirmDelete() {
    setSaving(true);
    try {
      await deleteManagedItem(type, deletingItem.id);
      setItems((current) => current.filter((item) => item.id !== deletingItem.id));
      setMessage({ text: "Elemento eliminato definitivamente.", error: false });
    } catch (error) {
      setMessage({ text: errorMessage(error, "Impossibile eliminare l'elemento."), error: true });
    } finally {
      setDeletingItem(null);
      setSaving(false);
    }
  }

  async function reorder(newOrder) {
    try {
      const updated = await reorderManagedItems(type, newOrder);
      setItems(sortItems(updated));
      setMessage({ text: "Ordine aggiornato.", error: false });
    } catch (error) {
      setMessage({ text: errorMessage(error, "Impossibile aggiornare l'ordine."), error: true });
    }
  }

  return {
    items, editingItem, deletingItem, formOpen, loading, saving, message,
    openNewItem, openEditItem, saveItem, changeStatus, confirmDelete, reorder,
    setDeletingItem, setFormOpen,
  };
}
