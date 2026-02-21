# 🃏 Raja Rani Chor Police - Online Multiplayer Game

The classic Indian party game, now playable online with friends!

## Features

- 🎮 **Real-time multiplayer** — Create rooms and invite friends via link
- 🎭 **4 or 5 player mode** — With or without Pradhan
- 🃏 **Card flip animations** — Each player sees their role privately
- 🎙️ **Push-to-talk voice chat** — Talk with friends during the game (WebRTC)
- 📊 **Live scoreboard** — Points tracked across multiple rounds
- 📱 **Mobile-friendly** — Works on phones and tablets
- 🌙 **Beautiful dark theme** — Designed for fun late-night gaming sessions

## Game Rules

| Role | Hindi | Points |
|------|-------|--------|
| 👑 Raja | राजा | 1000 |
| 👸 Rani | रानी | 900 |
| 🏛️ Pradhan | प्रधान | 800 |
| 🚔 Police | पुलिस | 700 (if correct) |
| 🦹 Chor | चोर | 0 (if caught) / 700 (if escaped) |

**Flow:** Chits dealt → Pradhan reveals → Police reveals → Police guesses Chor → Points awarded

## Tech Stack

- **Frontend:** Next.js 14 + Tailwind CSS
- **Real-time:** PartyKit (free tier)
- **Voice Chat:** WebRTC (peer-to-peer)
- **Hosting:** Vercel (free) + PartyKit (free)

---

## 🚀 Deployment Guide (100% Free)

### Step 1: Deploy PartyKit Server

1. Install PartyKit CLI:
   ```bash
   npm install -g partykit
   ```

2. Login to PartyKit:
   ```bash
   npx partykit login
   ```

3. Deploy the party server:
   ```bash
   npx partykit deploy
   ```

4. Note your PartyKit URL (e.g., `raja-rani-game.yourname.partykit.dev`)

### Step 2: Deploy to Vercel

1. Push code to GitHub

2. Go to [vercel.com](https://vercel.com) and import the repo

3. Add environment variable:
   - `NEXT_PUBLIC_PARTYKIT_HOST` = `raja-rani-game.yourname.partykit.dev`

4. Deploy!

### Local Development

```bash
# Install dependencies
npm install

# Terminal 1: Run PartyKit server
npx partykit dev

# Terminal 2: Run Next.js
npm run dev
```

Open http://localhost:3000

---

## How to Play

1. One person creates a room
2. Share the invite link/code with friends
3. Once 4-5 players join, host starts the round
4. Everyone sees their chit (role) privately
5. Pradhan reveals themselves (5-player mode)
6. Police reveals and guesses who the Chor is
7. Points are awarded, and the next round begins!
8. Host can end the game anytime to see final standings

## Voice Chat

- Click the 🎙️ button to enable voice
- **Hold** the button (or **hold Space bar**) to talk
- Release to mute — push-to-talk style!

---

Made with ❤️ for Indian game nights
