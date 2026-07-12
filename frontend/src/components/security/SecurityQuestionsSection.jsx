import { useEffect, useState } from "react";

import {
  getSecurity,
  updateSecurityAnswers,
} from "../../services/securityService";

const emptyAnswers = {
  middleSchoolAnswer: "",
  dogNameAnswer: "",
};

function CurrentAnswer({ label, value }) {
  const configured = Boolean(value);

  return (
    <p className="text-sm text-slate-600">
      {label}:{" "}
      <span className={configured ? "font-medium text-emerald-600" : "font-medium text-red-600"}>
        {configured ? value : "Non configurata"}
      </span>
    </p>
  );
}

export default function SecurityQuestionsSection() {
  const [savedAnswers, setSavedAnswers] = useState(emptyAnswers);
  const [middleSchoolAnswer, setMiddleSchoolAnswer] = useState("");
  const [dogNameAnswer, setDogNameAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  useEffect(() => {
    async function loadSecurity() {
      try {
        const data = await getSecurity();
        const answers = {
          middleSchoolAnswer: data.middleSchoolAnswer ?? "",
          dogNameAnswer: data.dogNameAnswer ?? "",
        };

        setSavedAnswers(answers);
        setMiddleSchoolAnswer(answers.middleSchoolAnswer);
        setDogNameAnswer(answers.dogNameAnswer);
      } catch (error) {
        setMessage({
          text: error.response?.data?.message ?? "Impossibile caricare le domande di sicurezza.",
          error: true,
        });
      } finally {
        setLoading(false);
      }
    }

    loadSecurity();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage({ text: "", error: false });

    try {
      const data = await updateSecurityAnswers(middleSchoolAnswer, dogNameAnswer);
      setSavedAnswers({ middleSchoolAnswer, dogNameAnswer });
      setMessage({
        text: data.message ?? "Domande di sicurezza aggiornate.",
        error: false,
      });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message ?? "Errore durante il salvataggio.",
        error: true,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-gray-300 bg-white p-8">
      <h2 className="text-xl font-semibold text-slate-900">Domande di sicurezza</h2>

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Caricamento in corso...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mt-8 space-y-2">
            <CurrentAnswer
              label="Risposta scuola media attualmente impostata"
              value={savedAnswers.middleSchoolAnswer}
            />
            <CurrentAnswer
              label="Risposta nome cane attualmente impostata"
              value={savedAnswers.dogNameAnswer}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6">
            <label className="text-sm font-medium text-slate-700">
              Scuola media frequentata
              <input
                type="text"
                value={middleSchoolAnswer}
                onChange={(event) => setMiddleSchoolAnswer(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Nome del cane
              <input
                type="text"
                value={dogNameAnswer}
                onChange={(event) => setDogNameAnswer(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </label>
          </div>

          {message.text && (
            <p className={`mgcf-toast px-4 py-3 text-sm font-semibold ${message.error ? "mgcf-toast--error" : "mgcf-toast--success"}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-8 rounded-md bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvataggio..." : "Aggiorna domande"}
          </button>
        </form>
      )}
    </section>
  );
}
