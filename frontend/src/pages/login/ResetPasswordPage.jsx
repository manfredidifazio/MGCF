import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import LoginBackground from "../../components/layout/LoginBackground";
import LoginCard from "../../components/cards/LoginCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { resetPassword } from "../../services/authService";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [fields, setFields] = useState({ password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");

  async function save(event) {
    event.preventDefault();
    const data = await resetPassword(params.get("token") || "", fields.password, fields.confirmPassword);
    setMessage(data.message ?? "Password aggiornata.");
  }

  return (
    <LoginBackground>
      <LoginCard>
        <form onSubmit={save} className="space-y-5">
          <Input label="Nuova password" type="password" value={fields.password} onChange={(event) => setFields((current) => ({ ...current, password: event.target.value }))} />
          <Input label="Conferma password" type="password" value={fields.confirmPassword} onChange={(event) => setFields((current) => ({ ...current, confirmPassword: event.target.value }))} />
          {message && <p className="mgcf-toast mgcf-toast--success px-4 py-3 text-sm font-semibold">{message}</p>}
          <Button type="submit" fullWidth>Salva password</Button>
          <Link to="/" className="block text-center text-sm text-amber-700">Torna al login</Link>
        </form>
      </LoginCard>
    </LoginBackground>
  );
}
