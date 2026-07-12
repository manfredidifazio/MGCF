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
        <button type="button" onClick={state.openNewItem} className="flex items-center justify-center gap-2 rounded-md border border-white/35 bg-white px-6 py-3 font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50">
          <Plus className="h-5 w-5" />
          {config.newLabel}
        </button>
      }
    >

      {state.message.text && (
        <p className={`mgcf-toast px-4 py-3 text-sm font-semibold ${state.message.error ? "mgcf-toast--error" : "mgcf-toast--success"}`}>{state.message.text}</p>
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
        <ManagedItemsList config={config} items={state.items} onDelete={state.setDeletingItem} onEdit={state.openEditItem} onStatusChange={state.changeStatus} onReorder={state.reorder} />
      )}

      <DeleteManagedItemDialog config={config} item={state.deletingItem} deleting={state.saving} onCancel={() => state.setDeletingItem(null)} onConfirm={state.confirmDelete} />
    </PageMask>
  );
}
