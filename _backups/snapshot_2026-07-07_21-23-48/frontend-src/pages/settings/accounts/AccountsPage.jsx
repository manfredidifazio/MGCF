import { BuildingLibraryIcon, PlusIcon } from "@heroicons/react/24/outline";

import AccountForm from "../../../components/accounts/AccountForm";
import AccountsList from "../../../components/accounts/AccountsList";
import DeleteAccountDialog from "../../../components/accounts/DeleteAccountDialog";
import PageMask from "../../../components/layout/PageMask";
import useAccounts from "../../../components/accounts/useAccounts";

export default function AccountsPage() {
  const state = useAccounts();

  return (
    <PageMask
      icon={BuildingLibraryIcon}
      title="Gestisci conti"
      description="Gestisci i conti utilizzati per accrediti, saldi e resoconti."
      actions={
        <button
          type="button"
          onClick={state.openNewAccount}
          className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600"
        >
          <PlusIcon className="h-5 w-5" />
          Nuovo conto
        </button>
      }
    >

      {state.message.text && (
        <p className={`mt-6 rounded-lg px-4 py-3 text-sm font-medium ${state.message.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {state.message.text}
        </p>
      )}

      {state.formOpen && (
        <AccountForm
          key={state.editingAccount?.id ?? "new"}
          account={state.editingAccount}
          saving={state.saving}
          onSave={state.saveAccount}
          onCancel={() => state.setFormOpen(false)}
        />
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
