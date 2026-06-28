"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ConnexionPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const isLogin = mode === "login";

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-ink">
          {isLogin ? "Bon retour" : "Créer un compte"}
        </h1>
        <p className="text-muted mt-2 text-sm">
          {isLogin
            ? "Connectez-vous pour retrouver vos comparaisons et alertes prix."
            : "Sauvegardez vos produits favoris et suivez leurs prix."}
        </p>
      </div>

      <div className="bg-white border border-line rounded-2xl p-7 shadow-[0_8px_28px_rgba(0,0,0,0.05)]">
        {/* Mode switch */}
        <div className="flex bg-cream rounded-full p-1 mb-6">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setSubmitted(false);
              }}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
                mode === m ? "bg-white text-ink shadow-sm" : "text-muted"
              }`}
            >
              {m === "login" ? "Se connecter" : "S'inscrire"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[0.8rem] font-medium text-ink mb-1.5">
                Nom
              </label>
              <input
                type="text"
                placeholder="Votre nom"
                className="w-full bg-cream border border-line rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus:border-brand transition-colors"
              />
            </div>
          )}
          <div>
            <label className="block text-[0.8rem] font-medium text-ink mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full bg-cream border border-line rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus:border-brand transition-colors"
            />
          </div>
          <div>
            <label className="block text-[0.8rem] font-medium text-ink mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-cream border border-line rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus:border-brand transition-colors"
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                className="text-[0.78rem] text-brand hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-brand hover:bg-brand-light text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isLogin ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        {submitted && (
          <p className="mt-4 text-center text-[0.8rem] text-brand bg-brand/8 rounded-xl py-2.5 px-3">
            ✦ Espace démo — l&apos;authentification n&apos;est pas encore
            connectée à un serveur.
          </p>
        )}

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-line" />
          <span className="text-[0.72rem] text-muted">ou</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="w-full flex items-center justify-center gap-2 border border-line bg-white hover:bg-cream text-ink font-medium py-2.5 rounded-xl text-sm transition-colors"
        >
          <span>🔵</span> Continuer avec Google
        </button>
      </div>

      <p className="text-center text-[0.78rem] text-muted mt-6">
        En continuant, vous acceptez nos conditions.{" "}
        <Link href="/" className="text-brand hover:underline">
          Retour à l&apos;accueil
        </Link>
      </p>
    </div>
  );
}
