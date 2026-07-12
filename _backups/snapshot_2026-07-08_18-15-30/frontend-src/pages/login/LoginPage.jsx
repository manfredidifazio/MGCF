import { useState } from "react";

import LoginCard from "../../components/cards/LoginCard";
import LoginForm from "../../components/forms/LoginForm";
import PasswordRecoveryForm from "../../components/forms/PasswordRecoveryForm";
import RegisterForm from "../../components/forms/RegisterForm";
import LoginBackground from "../../components/layout/LoginBackground";
import LoginHeader from "../../components/layout/LoginHeader";

export default function LoginPage() {
  const [mode, setMode] = useState("login");

  return (
    <LoginBackground>
      <div className="flex w-full items-center justify-center">
        <LoginCard>
          <LoginHeader mode={mode} />
          {mode === "recovery" ? (
            <PasswordRecoveryForm onBack={() => setMode("login")} />
          ) : mode === "register" ? (
            <RegisterForm onBack={() => setMode("login")} />
          ) : (
            <LoginForm onForgotPassword={() => setMode("recovery")} onRegister={() => setMode("register")} />
          )}
        </LoginCard>
      </div>
    </LoginBackground>
  );
}
