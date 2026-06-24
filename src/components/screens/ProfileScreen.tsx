import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { playerTag } from '../../services/leaderboard';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

/** Account profile: email, editable nickname, quick stats, password reset. */
export function ProfileScreen() {
  const goLeaderboard = useGameStore((s) => s.goLeaderboard);
  const user = useGameStore((s) => s.user);
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const signOut = useGameStore((s) => s.signOut);
  const resetPassword = useGameStore((s) => s.resetPassword);
  const deleteAccount = useGameStore((s) => s.deleteAccount);
  const starsByLevel = useGameStore((s) => s.starsByLevel);
  const achievements = useGameStore((s) => s.achievements);
  const stats = useGameStore((s) => s.stats);

  const [name, setName] = useState(nickname);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [delPwd, setDelPwd] = useState('');
  const [delErr, setDelErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDelErr(null);
    if (!delPwd) return setDelErr('Digite sua senha para confirmar.');
    setDeleting(true);
    const err = await deleteAccount(delPwd);
    setDeleting(false);
    if (err) setDelErr(err);
    // On success the store navigates home and this screen unmounts.
  }

  const totalStars = Object.values(starsByLevel).reduce((a, b) => a + b, 0);

  if (!user) {
    // Not logged in (e.g. just signed out): offer a way back, no side effects.
    return (
      <div className="screen">
        <p className="center muted">Você não está conectado.</p>
        <Button variant="green" block onClick={goLeaderboard}>
          Voltar ao ranking
        </Button>
      </div>
    );
  }

  function saveNick() {
    setNickname(name);
    setMsg({ ok: true, text: 'Apelido salvo!' });
  }

  async function sendReset() {
    if (!user?.email) return;
    setBusy(true);
    const err = await resetPassword(user.email);
    setBusy(false);
    setMsg(
      err
        ? { ok: false, text: err }
        : {
            ok: true,
            text: `E-mail enviado para ${user.email}. Cheque também a caixa de spam/lixo eletrônico.`,
          },
    );
  }

  return (
    <div className="screen">
      <div className="row spread">
        <Button variant="ghost" small icon onClick={goLeaderboard}>
          ←
        </Button>
        <h2 className="section-title" style={{ margin: 0 }}>
          👤 Perfil
        </h2>
        <div style={{ width: 50 }} />
      </div>

      <div className="panel stack">
        <div className="account">
          <div className="account__info">
            <strong>
              {nickname || user.name}
              <span className="ranking__tag">#{playerTag(user.uid)}</span>
            </strong>
            <span className="muted" style={{ fontSize: 12 }}>
              {user.email}
            </span>
            <span className="muted" style={{ fontSize: 11 }}>
              Seu ID fixo no ranking: #{playerTag(user.uid)} (não muda quando
              você troca o apelido)
            </span>
          </div>
        </div>

        <label className="stat__label" htmlFor="nick">
          Apelido no ranking
        </label>
        <div className="row" style={{ gap: 8 }}>
          <input
            id="nick"
            className="nick-input"
            maxLength={18}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button variant="green" small onClick={saveNick}>
            Salvar
          </Button>
        </div>
      </div>

      <div className="panel">
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat__num">⭐ {totalStars}</span>
            <span className="muted">estrelas</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__num">🏅 {achievements.length}</span>
            <span className="muted">conquistas</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__num">
              🏆 {stats.bestScore.toLocaleString('pt-BR')}
            </span>
            <span className="muted">recorde</span>
          </div>
        </div>
      </div>

      <div className="panel stack">
        <Button variant="ghost" block disabled={busy} onClick={sendReset}>
          {busy ? 'Enviando…' : '📧 Redefinir senha'}
        </Button>
        <Button variant="ghost" block onClick={signOut}>
          🚪 Sair da conta
        </Button>
        {msg && (
          <p className={msg.ok ? 'auth-ok' : 'auth-error'}>
            {msg.ok ? '✅' : '⚠️'} {msg.text}
          </p>
        )}
        <button className="danger-link" onClick={() => setShowDelete(true)}>
          Excluir minha conta
        </button>
      </div>

      {showDelete && (
        <Modal>
          <button
            className="modal__close"
            aria-label="Fechar"
            onClick={() => setShowDelete(false)}
          >
            ✕
          </button>
          <h2 className="modal__title">Excluir conta</h2>
          <p className="muted" style={{ fontSize: 13 }}>
            Isso apaga sua conta, suas pontuações no ranking e o progresso salvo
            na nuvem. <strong>Não dá para desfazer.</strong>
          </p>
          <p className="stat__label" style={{ textAlign: 'left' }}>
            Confirme sua senha:
          </p>
          <input
            className="nick-input"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            value={delPwd}
            onChange={(e) => setDelPwd(e.target.value)}
          />
          {delErr && <p className="auth-error">⚠️ {delErr}</p>}
          <div className="stack" style={{ marginTop: 10 }}>
            <Button variant="pink" block disabled={deleting} onClick={confirmDelete}>
              {deleting ? 'Excluindo…' : 'Excluir conta permanentemente'}
            </Button>
            <Button
              variant="ghost"
              block
              disabled={deleting}
              onClick={() => setShowDelete(false)}
            >
              Cancelar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
