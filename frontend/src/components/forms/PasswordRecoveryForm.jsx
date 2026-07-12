import { useState } from "react";

import { forgotPassword } from "../../services/authService";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function PasswordRecoveryForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", error: false });

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const data = await forgotPassword(email);
      setMessage({ text: data.message, error: false });
    } catch (error) {
      setMessage({ text: error.response?.data?.message ?? "Errore durante il recupero.", error: true });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      {message.text && <p className={`mgcf-toast px-4 py-3 text-sm font-semibold ${message.error ? "mgcf-toast--error" : "mgcf-toast--success"}`}>{message.text}</p>}
      <Button type="submit" fullWidth>Invia link di recupero</Button>
      <button type="button" onClick={onBack} className="block w-full text-center text-sm font-medium text-slate-500 transition hover:text-amber-600">Torna alla schermata di accesso</button>
    </form>
  );
}
