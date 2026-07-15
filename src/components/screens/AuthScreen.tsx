import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';
import { useT } from '../../i18n';

/** Email/password login + sign-up screen (works on web and in the native app). */
export function AuthScreen() {
  const t = useT();
  const goLeaderboard = useGameStore((s) => s.goLeaderboard);
  const goHome = useGameStore((s) => s.goHome);
  const signInEmail = useGameStore((s) => s.signInEmail);
  const signUpEmail = useGameStore((s) => s.signUpEmail);
  const resetPassword = useGameStore((s) => s.resetPassword);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function forgotPassword() {
    setError(null);
    setInfo(null);
    if (!email.trim()) return setError(t('auth.errResetEmail'));
    setBusy(true);
    const err = await resetPassword(email);
    setBusy(false);
    if (err) setError(err);
    else setInfo(t('auth.resetSent', { email: email.trim() }));
  }

  const isSignup = mode === 'signup';

  async function submit() {
    setError(null);
    if (!email.trim()) return setError(t('auth.errEmail'));
    if (password.length < 6) return setError(t('auth.errPassword'));
    if (isSignup && !nickname.trim()) return setError(t('auth.errNickname'));

    setBusy(true);
    const err = isSignup
      ? await signUpEmail(email, password, nickname)
      : await signInEmail(email, password);
    setBusy(false);

    if (err) setError(err);
    else goLeaderboard();
  }

  return (
    <div className="screen">
      <div className="row spread">
        <Button
          variant="ghost"
          small
          icon
          aria-label={t('common.back')}
          onClick={goHome}
        >
          ←
        </Button>
        <h2 className="section-title" style={{ margin: 0 }}>
          {isSignup ? t('auth.signUp') : t('auth.signIn')}
        </h2>
        <div style={{ width: 50 }} />
      </div>

      <div className="logo" style={{ marginTop: 0 }}>
        <span className="logo__cat" aria-hidden>
          🐱
        </span>
      </div>

      <div className="auth-tabs">
        <button
          className={`auth-tab ${!isSignup ? 'on' : ''}`}
          onClick={() => {
            setMode('login');
            setError(null);
          }}
        >
          {t('auth.signIn')}
        </button>
        <button
          className={`auth-tab ${isSignup ? 'on' : ''}`}
          onClick={() => {
            setMode('signup');
            setError(null);
          }}
        >
          {t('auth.signUp')}
        </button>
      </div>

      <div className="panel stack">
        <label className="stat__label" htmlFor="email">
          {t('auth.email')}
        </label>
        <input
          id="email"
          className="nick-input"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="stat__label" htmlFor="password">
          {t('auth.password')}
        </label>
        <input
          id="password"
          className="nick-input"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isSignup && (
          <>
            <label className="stat__label" htmlFor="nick">
              {t('auth.nickname')}
            </label>
            <input
              id="nick"
              className="nick-input"
              maxLength={18}
              placeholder={t('auth.nicknamePlaceholder')}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </>
        )}

        {error && <p className="auth-error">⚠️ {error}</p>}
        {info && <p className="auth-ok">✅ {info}</p>}

        <Button variant="green" block disabled={busy} onClick={submit}>
          {busy ? '...' : isSignup ? t('auth.submitSignUp') : t('auth.submitSignIn')}
        </Button>

        {!isSignup && (
          <button
            type="button"
            className="auth-link"
            disabled={busy}
            onClick={forgotPassword}
          >
            {t('auth.forgot')}
          </button>
        )}

        <p className="muted center" style={{ fontSize: 12, margin: 0 }}>
          {isSignup ? t('auth.hintHaveAccount') : t('auth.hintNewHere')}
        </p>
        {isSignup && (
          <p className="muted center" style={{ fontSize: 11, margin: 0 }}>
            {t('auth.privacyNoticePre')}
            <a
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="auth-link"
            >
              {t('auth.privacyLink')}
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
