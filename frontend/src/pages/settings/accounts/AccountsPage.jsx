import { Landmark, Plus } from "lucide-react";
import { useEffect, useRef } from "react";

import AccountForm from "../../../components/accounts/AccountForm";
import AccountsList from "../../../components/accounts/AccountsList";
import DeleteAccountDialog from "../../../components/accounts/DeleteAccountDialog";
import PageMask from "../../../components/layout/PageMask";
import useAccounts from "../../../components/accounts/useAccounts";
import { scrollToElement } from "../../../utils/scrollToElement";

export default function AccountsPage() {
  const state = useAccounts();
  const formRef = useRef(null);

  useEffect(() => {
    if (state.formOpen) scrollToElement(formRef.current);
  }, [state.formOpen]);

  return (
    <PageMask
      icon={Landmark}
      title="Gestisci conti"
      description="Gestisci i conti utilizzati per accrediti, saldi e resoconti."
      actions={
        <button
          type="button"
          onClick={state.openNewAccount}
          className="flex items-center justify-center gap-2 rounded-md border border-white/35 bg-white px-6 py-3 font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
        >
          <Plus className="h-5 w-5" />
          Nuovo conto
        </button>
      }
    >

      {state.message.text && (
        <p className={`mgcf-toast px-4 py-3 text-sm font-semibold ${state.message.error ? "mgcf-toast--error" : "mgcf-toast--success"}`}>
          {state.message.text}
        </p>
      )}

      {state.formOpen && (
        <div ref={formRef}>
          <AccountForm
            key={state.editingAccount?.id ?? "new"}
            account={state.editingAccount}
            saving={state.saving}
            onSave={state.saveAccount}
            onCancel={() => state.setFormOpen(false)}
          />
        </div>
      )}

      {state.loading ? (
        <p className="mt-8 text-sm text-slate-500">Caricamento conti...</p>
      ) : (
        <AccountsList
          accounts={state.accounts}
          onDelete={state.setDeletingAccount}
          onEdit={state.openEditAccount}
          onStatusChange={state.changeStatus}
        />
      )}

      <DeleteAccountDialog
        account={state.deletingAccount}
        deleting={state.saving}
        onCancel={() => state.setDeletingAccount(null)}
        onConfirm={state.confirmDelete}
      />
    </PageMask>
  );
}
