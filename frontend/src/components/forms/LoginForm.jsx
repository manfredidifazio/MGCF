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
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Email" type="email" value={fields.email} onChange={(event) => setFields((current) => ({ ...current, email: event.target.value }))} />
      <Input label="Password" type="password" value={fields.password} onChange={(event) => setFields((current) => ({ ...current, password: event.target.value }))} />
      {message && <p className="mgcf-toast mgcf-toast--error px-4 py-3 text-sm font-semibold">{message}</p>}
      <Button type="submit" fullWidth variant="orange">Accedi</Button>
      <div className="space-y-2 pt-1 text-center text-sm">
        <button type="button" onClick={onForgotPassword} className="block w-full text-slate-600 transition hover:text-orange-500">Hai dimenticato la password?</button>
        <button type="button" onClick={onRegister} className="block w-full font-medium text-indigo-700 transition hover:text-orange-500">Registrati</button>
      </div>
    </form>
  );
}
