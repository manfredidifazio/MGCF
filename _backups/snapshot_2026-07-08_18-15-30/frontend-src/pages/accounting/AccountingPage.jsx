import PageMask from "../../components/layout/PageMask";

const descriptions = {
  accredits: "Registra un nuovo accredito associandolo a uno dei conti configurati.",
  statements: "Consulta e gestisci gli estratti conto.",
  balances: "Visualizza i saldi aggiornati dei conti.",
  reports: "Consulta il resoconto complessivo della contabilità.",
  fiscalReports: "Consulta il resoconto complessivo di tasse, immobili e veicoli.",
};

export default function AccountingPage({ section, title }) {
  return (
    <PageMask title={title} description={descriptions[section]}>
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <p className="text-sm text-slate-500">Sezione contabile pronta per il prossimo passaggio operativo.</p>
      </div>
    </PageMask>
  );
}
