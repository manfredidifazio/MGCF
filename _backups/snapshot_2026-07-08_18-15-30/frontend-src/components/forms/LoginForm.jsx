import { useState } from "react";

import { login } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function LoginForm({ onForgotPassword, onRegister }) {
  const { loginUser } = useAuth();
  const [fields, setFields] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    try {
      const response = await login(fields.email, fields.password);
      if (response.success) loginUser(response.token, response.user);
      window.location.href = "/dashboard";
    } catch (error) {
      setMessage(error.response?.data?.message ?? "Errore durante il login.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input label="Email" type="email" value={fields.email} onChange={(event) => setFields((current) => ({ ...current, email: event.target.value }))} />
      <Input label="Password" type="password" value={fields.password} onChange={(event) => setFields((current) => ({ ...current, password: event.target.value }))} />
      {message && <p className="text-center text-sm font-medium text-red-600">{message}</p>}
      <Button type="submit" fullWidth>Accedi</Button>
      <div className="space-y-2 text-center text-sm">
        <button type="button" onClick={onForgotPassword} className="block w-full text-slate-500 transition hover:text-amber-600">Hai dimenticato la password?</button>
        <button type="button" onClick={onRegister} className="block w-full font-medium text-amber-700 transition hover:text-amber-900">Registrati</button>
      </div>
    </form>
  );
}
