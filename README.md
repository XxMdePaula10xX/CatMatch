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

## 🚀 After the MVP

Lives, booster shop, coins, more levels, a progression map, cat skins, daily
events, leaderboards, and a Capacitor/React Native mobile build.
