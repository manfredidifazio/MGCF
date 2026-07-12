import PageMask from "../../components/layout/PageMask";
import PasswordSection from "../../components/security/PasswordSection";
import SecurityQuestionsSection from "../../components/security/SecurityQuestionsSection";

export default function SecurityPage() {
  return (
    <PageMask title="Sicurezza" description="Gestisci la parola d'ordine e le domande di sicurezza del tuo account.">
      <PasswordSection />
      <SecurityQuestionsSection />
    </PageMask>
  );
}
