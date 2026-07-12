import { useState } from "react";

import { register } from "../../services/authService";
import Button from "../ui/Button";
import Input from "../ui/Input";

const initial = { username: "", email: "", password: "", confirmPassword: "" };

export default function RegisterForm({ onBack }) {
  const [fields, setFields] = useState(initial);
  const [message, setMessage] = useState({ text: "", error: false });

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const data = await register(fields);
      setFields(initial);
      setMessage({ text: data.message, error: false });
    } catch (error) {
      setMessage({ text: error.response?.data?.message ?? "Errore durante la registrazione.", error: true });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Nome utente" value={fields.username} onChange={(event) => setFields((current) => ({ ...current, username: event.target.value }))} />
      <Input label="Email" type="email" value={fields.email} onChange={(event) => setFields((current) => ({ ...current, email: event.target.value }))} />
      <Input label="Password" type="password" value={fields.password} onChange={(event) => setFields((current) => ({ ...current, password: event.target.value }))} />
      <Input label="Conferma password" type="password" value={fields.confirmPassword} onChange={(event) => setFields((current) => ({ ...current, confirmPassword: event.target.value }))} />
      {message.text && <p className={`text-center text-sm font-medium ${message.error ? "text-red-600" : "text-emerald-600"}`}>{message.text}</p>}
      <Button type="submit" fullWidth>Registrati</Button>
      <button type="button" onClick={onBack} className="block w-full text-center text-sm font-medium text-slate-500 transition hover:text-amber-600">Torna al login</button>
    </form>
  );
}
