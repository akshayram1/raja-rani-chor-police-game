# 🃏 Raja Rani Chor Police - Online Multiplayer Game

The classic Indian party game, now playable online with friends!

**Live:** [raja-rani-chor-police-game.vercel.app](https://raja-rani-chor-police-game.vercel.app)

---

## Features

- 🎮 **Real-time multiplayer** — Create rooms and invite friends via link or code
- 🌐 **Active Rooms** — Browse and join active rooms from the home page
- 🎭 **4 or 5 player mode** — With or without Pradhan
- 🃏 **Card flip animations** — Each player sees their role privately
- 🎙️ **Voice chat** — Mic on/off toggle + push-to-talk (WebRTC peer-to-peer)
- 💬 **Text chat** — In-game text messaging with emoji reactions (😂🔥👏😱💀)
- ⏱️ **Police timer** — 30-second countdown for the police to guess
- 🔄 **Auto-advance rounds** — 10-second timer between rounds
- 🎵 **Background music** — Procedural Indian-inspired lo-fi (toggle on/off)
- 🔊 **Sound effects** — Card deal, correct/wrong guess, timer beep, game over fanfare
- 📊 **Live leaderboard** — Persistent sidebar scoreboard
- ❓ **How to Play** — In-game rules modal
- 👢 **Kick players** — Host can remove players
- 🔌 **Auto-remove** — Disconnected players auto-removed after 15 seconds
- ⚙️ **Round settings** — Host can set round count (3/5/7/10) and player count (4/5)
- 📱 **Mobile-friendly** — Fully responsive design
- 🌙 **Dark theme** — Designed for fun late-night gaming sessions
- 👑 **Custom crown favicon** — SVG logo

---

## Game Rules

| Role | Hindi | Points |
|------|-------|--------|
| 👑 Raja | राजा | 1000 |
| 👸 Rani | रानी | 900 |
| 🏛️ Pradhan | प्रधान | 800 (0 in 4-player mode) |
| 🚔 Police | पुलिस | 700 (if guess correct) |
| 🦹 Chor | चोर | 0 (if caught) / 700 (if police guesses wrong) |

### Round Flow

1. Cards are dealt — only you see your role
2. Pradhan reveals themselves (skipped in 4-player mode)
3. Police reveals themselves
4. Police has **30 seconds** to guess who the Chor is
5. Points are awarded
6. Next round auto-starts after 10 seconds (or host can advance/end early)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + React 18 |
| Styling | Tailwind CSS 3.4 |
| Animations | Framer Motion |
| Real-time | PartyKit (WebSocket server) |
| Voice Chat | WebRTC (peer-to-peer via STUN) |
| Sound/Music | Web Audio API (procedural generation) |
| Hosting | Vercel (frontend) + PartyKit (backend) |
| Language | TypeScript 5 |

---

## 🚀 Deployment Guide (100% Free)

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- A [GitHub](https://github.com/) account
- A [Vercel](https://vercel.com/) account (free tier)
- A [PartyKit](https://www.partykit.io/) account (free tier)

### Step 1: Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/raja-rani-chor-police-game.git
cd raja-rani-chor-police-game
npm install
```

### Step 2: Deploy PartyKit Server

PartyKit hosts the real-time WebSocket server (game logic + lobby).

```bash
# Login to PartyKit (opens browser for auth)
npx partykit login

# Deploy the server
npx partykit deploy
```

After deployment, you'll see a URL like:
```
Deployed to https://raja-rani-game.YOURUSERNAME.partykit.dev
```

> **Note:** The project uses two PartyKit "parties":
> - `party/game.ts` — Main game server (handles rooms, roles, scoring)
> - `party/lobby.ts` — Lobby server (tracks active rooms for the home page)
>
> Both are configured in `partykit.json` and deployed together.

### Step 3: Configure Environment

Create a `.env` file in the project root:

```bash
NEXT_PUBLIC_PARTYKIT_HOST=raja-rani-game.YOURUSERNAME.partykit.dev
```

Replace `YOURUSERNAME` with your actual PartyKit username.

### Step 4: Deploy to Vercel

#### Option A: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

When prompted, add the environment variable:
- **Name:** `NEXT_PUBLIC_PARTYKIT_HOST`
- **Value:** `raja-rani-game.YOURUSERNAME.partykit.dev`

#### Option B: Via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_PARTYKIT_HOST` = `raja-rani-game.YOURUSERNAME.partykit.dev`
4. Click **Deploy**

### Step 5: Verify

1. Open your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Create a room and share the link with a friend
3. Both should be able to join, see roles, and play!

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Terminal 1: Run PartyKit dev server (WebSocket backend)
npx partykit dev

# Terminal 2: Run Next.js dev server (frontend)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The local PartyKit server runs on `localhost:1999`.

---

## Project Structure

```
├── party/
│   ├── game.ts          # PartyKit game server (rooms, roles, scoring, timers)
│   └── lobby.ts         # PartyKit lobby server (active rooms tracking)
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with metadata & favicon
│   │   ├── globals.css      # Global styles & animations
│   │   ├── page.tsx         # Home page (Create/Join/Active Rooms)
│   │   └── room/[id]/
│   │       └── page.tsx     # Game room page
│   ├── components/
│   │   ├── AudioChat.tsx        # Voice chat (WebRTC, mic toggle + PTT)
│   │   ├── DealingPhase.tsx     # Card dealing animation
│   │   ├── EmojiReactions.tsx   # Emoji reactions + text chat
│   │   ├── LeaderboardPanel.tsx # Right sidebar leaderboard
│   │   ├── Lobby.tsx            # Lobby (round/player settings)
│   │   ├── PlayerBar.tsx        # Player avatars + kick button
│   │   ├── PoliceGuessPhase.tsx # Police guess with countdown timer
│   │   ├── ResultPhase.tsx      # Round results + auto-advance
│   │   ├── RevealPhase.tsx      # Pradhan/Police reveal
│   │   └── Scoreboard.tsx       # Final scoreboard + Play Again
│   └── lib/
│       ├── types.ts         # Shared types (GameState, Role, etc.)
│       ├── sounds.ts        # Sound effects (Web Audio API)
│       └── bgMusic.ts       # Background music (procedural, Web Audio API)
├── public/
│   ├── favicon.svg          # Crown favicon
│   └── apple-touch-icon.svg # Apple touch icon
├── partykit.json            # PartyKit config (game + lobby parties)
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## Updating After Changes

After making code changes, redeploy both services:

```bash
# Deploy PartyKit (if party/ files changed)
npx partykit deploy

# Deploy Vercel (if frontend files changed)
vercel --prod
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Can't connect to room | Check `NEXT_PUBLIC_PARTYKIT_HOST` env var matches your PartyKit URL |
| Voice chat not working | Ensure browser has microphone permission; works best on Chrome/Edge |
| Active rooms not showing | Verify lobby party deployed (`partykit.json` has `"parties": { "lobby": "party/lobby.ts" }`) |
| Players not auto-removed | Redeploy PartyKit: `npx partykit deploy` |
| Music not stopping | Click the 🎵 toggle again; if stuck, refresh the page |

---

Made with ❤️ by **Akshay Chame** 🇮🇳
