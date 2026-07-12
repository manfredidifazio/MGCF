import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { catalogConfigs } from "../../components/catalog/catalogConfig";
import PageMask from "../../components/layout/PageMask";
import { getManagedItems } from "../../services/managedItemService";

export default function ManagedItemDetailPage({ type }) {
  const { id } = useParams();
  const config = catalogConfigs[type];
  const Icon = config.icon;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getManagedItems(type)
      .then((items) => setItem(items.find((entry) => String(entry.id) === id) ?? null))
      .finally(() => setLoading(false));
  }, [id, type]);

  if (loading) return <p className="text-sm text-slate-500">Caricamento...</p>;

  if (!item) {
    return (
      <PageMask title="Elemento non trovato">
        <Link to={config.settingsPath} className="inline-block text-sm text-amber-700">Torna alle impostazioni</Link>
      </PageMask>
    );
  }

  return (
    <PageMask icon={Icon} title={item.name} description={config.summary(item)}>
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <h2 className="text-lg font-semibold text-slate-900">Dati registrati</h2>
        <dl className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {config.fields.filter((field) => field.name !== "name" && item[field.name]).map((field) => (
            <div key={field.name} className={field.full ? "md:col-span-2" : ""}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{field.label}</dt>
              <dd className="mt-1 text-sm text-slate-700">{String(item[field.name])}</dd>
            </div>
          ))}
        </dl>
        <Link to={config.settingsPath} className="mt-8 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50">
          Gestisci in Impostazioni
        </Link>
      </div>
    </PageMask>
  );
}
