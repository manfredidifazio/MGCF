import Logo from "../ui/Logo";

export default function LoginHeader({ mode = "login" }) {
  const title = mode === "register" ? "Crea account" : mode === "recovery" ? "Recupera password" : "";
  const description = mode === "register"
    ? "Inserisci i dati e attendi la conferma dell'amministratore."
    : mode === "recovery"
      ? "Il recupero via email è disattivato: contatta l'amministratore."
      : "Accedi con email e password.";
  return (
    <header className="mb-10">
      <div className="flex justify-center">
        <Logo />
      </div>

      {mode !== "login" && (
        <h1 className="mt-10 text-center text-4xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
      )}

      <p className={`${mode !== "login" ? "mt-4" : "mt-10"} text-center text-slate-500`}>{description}</p>
    </header>
  );
}
