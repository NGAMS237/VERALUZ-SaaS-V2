/**
 * src/app/login/page.tsx
 * Page de connexion email + mot de passe.
 *
 * F1 implémente uniquement : email/password, connexion, déconnexion.
 * Pas d'OAuth, magic link, téléphone, passkeys ou MFA.
 */

import { login } from "./actions";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, redirectTo } = await searchParams;

  return (
    <div className="vlz-login-container">
      <div className="vlz-login-card">
        <h1 className="vlz-login-title">VERALUZ</h1>
        <p className="vlz-login-subtitle">Connexion à votre espace</p>

        {error !== undefined && error !== "" && (
          <div className="vlz-login-error" role="alert">
            {error === "invalid_credentials"
              ? "Email ou mot de passe incorrect."
              : error === "missing_fields"
                ? "Veuillez renseigner votre email et mot de passe."
                : "Une erreur est survenue. Réessayez."}
          </div>
        )}

        <form action={login} className="vlz-login-form">
          {redirectTo !== undefined && redirectTo !== "" && (
            <input type="hidden" name="redirectTo" value={redirectTo} />
          )}
          <div className="vlz-form-group">
            <label htmlFor="email" className="vlz-label">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="vlz-input"
              placeholder="vous@exemple.com"
            />
          </div>
          <div className="vlz-form-group">
            <label htmlFor="password" className="vlz-label">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="vlz-input"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="vlz-btn-primary">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
