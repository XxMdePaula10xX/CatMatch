import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';

/** Email/password login + sign-up screen (works on web and in the native app). */
export function AuthScreen() {
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
    if (!email.trim())
      return setError('Digite seu e-mail acima para redefinir a senha.');
    setBusy(true);
    const err = await resetPassword(email);
    setBusy(false);
    if (err) setError(err);
    else
      setInfo(
        `Enviamos um link para ${email.trim()}. Não esqueça de checar a caixa de spam/lixo eletrônico.`,
      );
  }

  const isSignup = mode === 'signup';

  async function submit() {
    setError(null);
    if (!email.trim()) return setError('Digite seu e-mail.');
    if (password.length < 6)
      return setError('A senha precisa de pelo menos 6 caracteres.');
    if (isSignup && !nickname.trim())
      return setError('Escolha um apelido para o ranking.');

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
        <Button variant="ghost" small icon onClick={goHome}>
          ←
        </Button>
        <h2 className="section-title" style={{ margin: 0 }}>
          {isSignup ? 'Criar conta' : 'Entrar'}
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
          Entrar
        </button>
        <button
          className={`auth-tab ${isSignup ? 'on' : ''}`}
          onClick={() => {
            setMode('signup');
            setError(null);
          }}
        >
          Criar conta
        </button>
      </div>

      <div className="panel stack">
        <label className="stat__label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          className="nick-input"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="stat__label" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          className="nick-input"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          placeholder="mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isSignup && (
          <>
            <label className="stat__label" htmlFor="nick">
              Apelido no ranking
            </label>
            <input
              id="nick"
              className="nick-input"
              maxLength={18}
              placeholder="Seu nome no ranking"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </>
        )}

        {error && <p className="auth-error">⚠️ {error}</p>}
        {info && <p className="auth-ok">✅ {info}</p>}

        <Button variant="green" block disabled={busy} onClick={submit}>
          {busy ? '...' : isSignup ? 'Criar conta 🐾' : 'Entrar ▶'}
        </Button>

        {!isSignup && (
          <button
            type="button"
            className="auth-link"
            disabled={busy}
            onClick={forgotPassword}
          >
            Esqueci minha senha
          </button>
        )}

        <p className="muted center" style={{ fontSize: 12, margin: 0 }}>
          {isSignup
            ? 'Já tem conta? Toque em "Entrar" acima.'
            : 'Novo por aqui? Toque em "Criar conta" acima.'}
        </p>
      </div>
    </div>
  );
}
