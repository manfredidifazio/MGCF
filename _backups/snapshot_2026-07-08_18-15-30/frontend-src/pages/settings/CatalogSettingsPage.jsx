import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";

import DeleteManagedItemDialog from "../../components/catalog/DeleteManagedItemDialog";
import PageMask from "../../components/layout/PageMask";
import ManagedItemForm from "../../components/catalog/ManagedItemForm";
import ManagedItemsList from "../../components/catalog/ManagedItemsList";
import { catalogConfigs } from "../../components/catalog/catalogConfig";
import useManagedItems from "../../components/catalog/useManagedItems";
import { scrollToElement } from "../../utils/scrollToElement";

export default function CatalogSettingsPage({ type }) {
  const config = catalogConfigs[type];
  const state = useManagedItems(type);
  const Icon = config.icon;
  const formRef = useRef(null);

  useEffect(() => {
    if (state.formOpen) scrollToElement(formRef.current);
  }, [state.formOpen]);

  return (
    <PageMask
      icon={Icon}
      title={`Gestisci ${config.plural.toLocaleLowerCase("it")}`}
      description={config.description}
      actions={
        <button type="button" onClick={state.openNewItem} className="flex items-center justify-center gap-2 rounded-md bg-amber-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-600">
          <Plus className="h-5 w-5" />
          {config.newLabel}
        </button>
      }
    >

      {state.message.text && (
        <p className={`mt-6 rounded-md px-4 py-3 text-sm font-medium ${state.message.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{state.message.text}</p>
      )}

      {state.formOpen && (
        <div ref={formRef}>
          <ManagedItemForm
            key={state.editingItem?.id ?? "new"}
            config={config}
            item={state.editingItem}
            saving={state.saving}
            onSave={state.saveItem}
            onCancel={() => state.setFormOpen(false)}
          />
        </div>
      )}

      {state.loading ? (
        <p className="mt-8 text-sm text-slate-500">Caricamento...</p>
      ) : (
        <ManagedItemsList config={config} items={state.items} onDelete={state.setDeletingItem} onEdit={state.openEditItem} onStatusChange={state.changeStatus} />
      )}

      <DeleteManagedItemDialog config={config} item={state.deletingItem} deleting={state.saving} onCancel={() => state.setDeletingItem(null)} onConfirm={state.confirmDelete} />
    </PageMask>
  );
}
