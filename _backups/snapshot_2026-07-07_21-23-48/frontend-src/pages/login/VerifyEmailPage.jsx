import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import LoginBackground from "../../components/layout/LoginBackground";
import LoginCard from "../../components/cards/LoginCard";
import { verifyEmail } from "../../services/authService";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState("Verifica in corso...");

  useEffect(() => {
    verifyEmail(params.get("token") || "")
      .then((data) => setMessage(data.message))
      .catch((error) => setMessage(error.response?.data?.message ?? "Verifica non riuscita."));
  }, [params]);

  return <LoginBackground><LoginCard><p className="text-center text-slate-600">{message}</p><Link to="/" className="mt-6 block text-center text-amber-700">Vai al login</Link></LoginCard></LoginBackground>;
}
