import Logo from "../ui/Logo";

export default function LoginHeader({ mode = "login" }) {
  const description = mode === "register"
    ? "Inserisci i dati e attendi la conferma dell'amministratore."
    : mode === "recovery"
      ? "Il recupero via email è disattivato: contatta l'amministratore."
      : "Inserisci i tuoi dati per accedere";
  return (
    <header className="mb-6">
      <div className="flex justify-center">
        <Logo />
      </div>

      <p className="mt-4 text-center text-sm text-slate-600">{description}</p>
    </header>
  );
}
