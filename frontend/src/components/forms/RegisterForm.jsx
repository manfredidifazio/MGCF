import { useState } from "react";

import { register } from "../../services/authService";
import Button from "../ui/Button";
import Input from "../ui/Input";

const initial = { email: "", password: "", confirmPassword: "" };

export default function RegisterForm({ onBack }) {
  const [fields, setFields] = useState(initial);
  const [message, setMessage] = useState({ text: "", error: false });
  const [isRegistered, setIsRegistered] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const data = await register(fields);
      setFields(initial);
      setIsRegistered(true);
      setMessage({ text: data.message, error: false });
    } catch (error) {
      setMessage({ text: error.response?.data?.message ?? "Errore durante la registrazione.", error: true });
    }
  }

  if (isRegistered) {
    return (
      <div className="space-y-4 text-center">
        <p className="mgcf-toast mgcf-toast--success px-4 py-3 text-sm font-semibold">{message.text}</p>
        <p className="text-sm text-slate-600">Controlla la tua email per completare la registrazione.</p>
        <button type="button" onClick={onBack} className="block w-full text-center text-sm font-medium text-slate-500 transition hover:text-amber-600">Torna al login</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Email" type="email" value={fields.email} onChange={(event) => setFields((current) => ({ ...current, email: event.target.value }))} required />
      <Input label="Password" type="password" value={fields.password} onChange={(event) => setFields((current) => ({ ...current, password: event.target.value }))} required />
      <Input label="Conferma password" type="password" value={fields.confirmPassword} onChange={(event) => setFields((current) => ({ ...current, confirmPassword: event.target.value }))} required />
      {message.text && <p className={`mgcf-toast px-4 py-3 text-sm font-semibold ${message.error ? "mgcf-toast--error" : "mgcf-toast--success"}`}>{message.text}</p>}
      <Button type="submit" fullWidth>Registrati</Button>
      <button type="button" onClick={onBack} className="block w-full text-center text-sm font-medium text-slate-500 transition hover:text-amber-600">Torna al login</button>
    </form>
  );
}
