# 🐱 Cat Match — Match-3 de Gatinhos

A cute, original match-3 puzzle game starring cats with personalities, rolling
yarn balls, and a sleepy **Boss Cat** that wakes up to clear the board. Built as
a polished, browser-playable MVP with React + TypeScript + Vite.

> Original artwork/identity — inspired by the genre, **not** by any specific
> commercial title. Visuals currently use emoji + CSS placeholders, ready to be
> swapped for final assets.

## ▶ Running

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check + production build
npm run typecheck  # types only
npm run smoke      # headless engine smoke test (no browser)
```

## 🎮 Gameplay

- **8×8 board.** Swap two adjacent cats to make lines of 3+.
- **Personalities (Mechanic 1).** Each cat has a power that fires on a match:
  - 🐱 Orange — *Alegre*: +20% score.
  - 😺 Gray — *Esperto*: reveals a hint.
  - 😸 White — *Mágico*: transforms a neighbour into a white cat (chains).
  - 🐈‍⬛ Black — *Sortudo*: extra damage to a nearby obstacle.
  - 😻 Siamese — *Charmoso*: extra Boss Cat energy.
  - 😽 Tabby — *Bagunceiro*: shuffles a nearby tile.
- **Special cats.** Match 4 → Ninja (clears a row/column), match 5 → Magician,
  L/T shape → Angry (3×3 blast). Sleepy & Lucky also supported.
- **Yarn balls (Mechanic 2) 🧶.** Match next to a yarn ball and it rolls away
  from the combo, clearing a path until it hits an edge or obstacle.
- **Boss Cat (Mechanic 3) 👑.** Combos charge the Boss meter; at 100 it performs
  the *Espreguiçada Real*, removing every cat of the most common type.
- **Obstacles.** Cardboard boxes (hp 2), scratchers, cat beds (fixed), spine
  blockers.
- **Boosters.** Paw Bomb (3×3) and Laser (row) are implemented; Rainbow Yarn and
  Giant Paw are shown as upcoming.

### Levels (MVP)

| # | Name | Objective | Moves |
|---|------|-----------|-------|
| 1 | Primeiros Miados | 500 points | 20 |
| 2 | Chuva de Laranjas | Collect 15 orange cats | 22 |
| 3 | Caixas Bagunceiras | Break 8 boxes | 25 |
| 4 | Rolando o Novelo | Activate 3 yarn balls | 25 |
| 5 | O Gato Chefe Acorda | Charge the Boss 2× | 28 |

Progress (unlocked levels + stars) is saved to `localStorage`.

## 🗂️ Project structure

```
src/
  components/
    board/   GameBoard, Tile, CatTile, ObstacleTile, YarnBallTile
    ui/      Button, ScoreCounter, MovesCounter, BossCatMeter,
             ObjectiveCard, Modal, VictoryModal, DefeatModal, BoosterButton
    screens/ HomeScreen, LevelSelectScreen, GameScreen
  data/      cats, levels, obstacles, boosters
  game/      boardGenerator, matchDetector, swapLogic, gravity,
             cascadeResolver, catPowers, specialPowers, yarnLogic,
             bossCatLogic, obstacleLogic, scoring, objectives, types, utils
  services/  soundManager (Web Audio placeholders)
  store/     gameStore (Zustand) — drives the animated resolution loop
  styles/    theme.css, game.css
```

The move-resolution order follows the PRD: swap → match → clear → personality
powers → obstacle damage → yarn → Boss charge → Boss power → gravity → refill →
cascade → objectives → moves → win/lose. The store commits intermediate board
snapshots so CSS transitions animate swaps, pops, and falls.

## ✨ Recursos de jogo

- **Tutorial interativo** — passo a passo na primeira vez (e reabrível em
  "❓ Como Jogar") explicando regras, poderes, especiais, novelo, chefe e modos.
- **Modos de jogo:**
  - 🐾 **Fases** — campanha de **60 níveis** com dificuldade crescente (5
    curados + 55 gerados proceduralmente, em 6 mundos temáticos).
  - 📅 **Desafio Diário** — tabuleiro idêntico para todos no mesmo dia (semente
    fixa), com **ranking do dia** e **resultado compartilhável** (estilo Wordle).
  - ⚡ **Relâmpago** — 60 segundos para pontuar o máximo (ranking semanal).
  - 🗺️ **Aventura (Roguelite)** — andares cada vez mais difíceis; entre eles,
    escolha **1 de 3 relíquias** que mudam as regras da run. Acaba quando você
    não bate a meta de um andar; ranking semanal por pontuação total.
- **Dificuldade adaptativa (DDA)** — perder uma fase repetidamente concede
  movimentos extras na próxima tentativa (apenas na campanha).
- **Toque ou arraste** um gatinho na direção desejada para trocar peças.
- **Juice:** squash & stretch nas peças, partículas ao explodir, *screen shake*
  em combos grandes e confete na vitória.
- **Cronômetro** por fase: quanto mais rápido, maior o multiplicador do
  **High Score** (×3 até 60s, ×2 até 120s, ×1.5 até 180s).
- **Conquistas** 🏅 — 8 objetivos de longo prazo (primeiro combo x5, quebrar
  100 caixas, etc.) com tela de progresso.
- **Guia de poderes** (botão ❓) explicando cada gato, especial e obstáculo.
- **Salvar & retomar:** a partida em andamento é salva automaticamente.
- **Ranking semanal + diário:** o ranking **zera toda semana** (temporadas) e o
  Diário é por dia. Sua posição aparece fixada mesmo fora do top 25.
- **Cloud Save:** logado, o progresso (fases, estrelas, recordes, conquistas)
  sincroniza entre aparelhos.

## 🖼️ Arte dos gatos (PNGs)

O jogo carrega as imagens finais de `public/cats/` (veja
`public/cats/README.md` para os nomes exatos). Enquanto um arquivo não existir,
o emoji é usado como reserva — então dá para adicionar um gato de cada vez.

## 🏆 Leaderboard global + login (Firebase)

**Jogar não exige conta** — o login serve só para entrar no ranking global.
Cada jogador logado mantém **um melhor recorde por fase**. Sem configuração, o
ranking roda em modo local (com nomes de exemplo) e o login fica desativado.

Para ativar online:

1. Crie um projeto em <https://console.firebase.google.com>.
2. Adicione um app **Web** e copie o `firebaseConfig`.
3. **Firestore Database:** ative (modo de produção).
4. **Authentication → Sign-in method:** ative **E-mail/senha** (Email/Password).
5. Em **Authentication → Settings → Authorized domains**, inclua o domínio onde
   o app roda (`localhost` já vem incluído para dev).
6. Copie `.env.example` para `.env`, preencha as chaves `VITE_FIREBASE_*` e rode
   `npm run dev` de novo.

### Regras do Firestore (cole na aba "Rules")

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Ranking: qualquer um lê; só o dono escreve a própria pontuação.
    match /scores/{docId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.data.uid == request.auth.uid;
    }
    // Cloud save: cada usuário só acessa o próprio documento.
    match /saves/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### Índices compostos

As consultas do ranking por board/semana usam índices compostos. Na primeira
vez que você filtrar por fase (F1–F5) ou abrir o Diário/Relâmpago, o Firestore
mostra um **erro com um link** — basta clicar nele para criar o índice em 1
clique. Campos usados: `board` + `periodId` + `score`, e `periodId` + `scope` +
`score` (para o "Geral").

## 📱 Publicar nas lojas (Capacitor)

O jogo é empacotado como app nativo com **Capacitor** (reaproveita o build web).
Como o iOS exige um Mac para compilar, usamos o **Codemagic** (Mac na nuvem) —
nenhum Mac local é necessário.

### Já configurado no repo
- `capacitor.config.ts` (appId `com.matheus.catmatch`)
- `assets/logo.svg` → ícone e splash gerados por `@capacitor/assets`
- `public/privacy.html` e `docs/privacy.html` → política de privacidade
- `codemagic.yaml` → pipelines de build iOS (App Store/TestFlight) e Android

### Hospedar a política de privacidade (GitHub Pages)
1. No GitHub: **Settings → Pages → Build and deployment**.
2. **Source: Deploy from a branch**, branch `main` (ou a sua), pasta **`/docs`**.
3. Salve. A URL fica:
   `https://<seu-usuario>.github.io/<repo>/privacy.html`
4. Use essa URL no campo "Privacy Policy URL" do App Store Connect.

> O GitHub Pages gratuito requer **repositório público**. Se o seu for privado,
> use o Firebase Hosting (você já tem Firebase) ou Netlify/Vercel — todos
> gratuitos.

### Passos (iOS, sem Mac)
1. No [Codemagic](https://codemagic.io): conecte este repositório.
2. **Code signing** → conecte sua conta Apple Developer via *App Store Connect
   API key* (assinatura automática).
3. Crie o grupo de variáveis `catmatch_env` com as chaves `VITE_FIREBASE_*`.
4. Ajuste `BUNDLE_ID` e `APP_STORE_APPLE_ID` no `codemagic.yaml`.
5. Rode o workflow **Cat Match — iOS**: ele builda o web, gera ícones, cria o
   projeto iOS, assina e envia ao **TestFlight**.
6. No **App Store Connect**: preencha metadados, screenshots, a URL da política
   de privacidade e envie para revisão.

### Localmente (se um dia tiver um Mac)
```bash
npm run build
npx cap add ios          # gera ios/ (precisa de macOS + Xcode + CocoaPods)
npm run cap:assets       # gera ícones/splash a partir de assets/logo.svg
npx cap open ios         # abre no Xcode
```

> **Login:** o app usa **e-mail/senha** (Firebase Auth), que funciona igual na
> web e no app nativo (iOS/Android) — sem popup e sem precisar de "Sign in with
> Apple". Habilite o provedor **E-mail/senha** no console do Firebase.

## 🚀 After the MVP

Lives, booster shop, coins, more levels, a progression map, cat skins, daily
events, leaderboards, and a Capacitor/React Native mobile build.
