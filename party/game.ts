import type * as Party from "partykit/server";

// ─── Types ───────────────────────────────────────────────────────────
type Role = "raja" | "rani" | "chor" | "police" | "pradhan";

interface Player {
  id: string;
  name: string;
  role?: Role;
  score: number;
  connected: boolean;
}

interface GameState {
  phase:
    | "lobby"
    | "dealing"
    | "reveal_pradhan"
    | "reveal_police"
    | "police_guess"
    | "result"
    | "scoreboard";
  players: Record<string, Player>;
  hostId: string | null;
  round: number;
  currentRoles: Record<string, Role>;
  policeId?: string;
  pradhanId?: string;
  policeGuess?: string;
  guessCorrect?: boolean;
  maxPlayers: number;
}

// ─── Points ──────────────────────────────────────────────────────────
const POINTS: Record<Role, number> = {
  raja: 1000,
  rani: 900,
  pradhan: 800,
  police: 700,
  chor: 0,
};

const POINTS_4P: Record<Role, number> = {
  raja: 1000,
  rani: 900,
  pradhan: 0,
  police: 700,
  chor: 0,
};

// ─── Helpers ─────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getInitialState(): GameState {
  return {
    phase: "lobby",
    players: {},
    hostId: null,
    round: 0,
    currentRoles: {},
    maxPlayers: 5,
  };
}

function sanitizeStateForPlayer(state: GameState, playerId: string) {
  // Each player only sees their own role, not others'
  const sanitized: any = {
    phase: state.phase,
    round: state.round,
    hostId: state.hostId,
    maxPlayers: state.maxPlayers,
    policeGuess: state.policeGuess,
    guessCorrect: state.guessCorrect,
    players: {} as Record<string, any>,
  };

  const playerCount = Object.keys(state.players).length;

  for (const [id, player] of Object.entries(state.players)) {
    sanitized.players[id] = {
      id: player.id,
      name: player.name,
      score: player.score,
      connected: player.connected,
      role: undefined as Role | undefined,
    };

    // Show role to the player themselves always after dealing
    if (id === playerId && state.phase !== "lobby") {
      sanitized.players[id].role = state.currentRoles[id];
    }

    // After result phase, show all roles
    if (state.phase === "result" || state.phase === "scoreboard") {
      sanitized.players[id].role = state.currentRoles[id];
    }

    // Show pradhan after reveal_pradhan phase
    if (
      state.pradhanId &&
      id === state.pradhanId &&
      ["reveal_pradhan", "reveal_police", "police_guess", "result", "scoreboard"].includes(state.phase)
    ) {
      sanitized.players[id].role = "pradhan";
    }

    // Show police after reveal_police phase
    if (
      state.policeId &&
      id === state.policeId &&
      ["reveal_police", "police_guess", "result", "scoreboard"].includes(state.phase)
    ) {
      sanitized.players[id].role = "police";
    }
  }

  // Include who is police (for police_guess phase)
  sanitized.policeId = state.policeId;
  sanitized.pradhanId = state.pradhanId;

  return sanitized;
}

// ─── Server ──────────────────────────────────────────────────────────
export default class GameServer implements Party.Server {
  state: GameState;

  constructor(readonly room: Party.Room) {
    this.state = getInitialState();
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    const name = url.searchParams.get("name") || "Player";
    const playerId = conn.id;

    // If player was already in the game (reconnection)
    if (this.state.players[playerId]) {
      this.state.players[playerId].connected = true;
    } else if (this.state.phase === "lobby") {
      // New player joining lobby
      const playerCount = Object.keys(this.state.players).length;
      if (playerCount >= this.state.maxPlayers) {
        conn.send(JSON.stringify({ type: "error", message: "Room is full" }));
        conn.close();
        return;
      }

      this.state.players[playerId] = {
        id: playerId,
        name: name,
        score: 0,
        connected: true,
      };

      // First player is host
      if (!this.state.hostId) {
        this.state.hostId = playerId;
      }
    } else {
      // Game already started, can't join
      conn.send(JSON.stringify({ type: "error", message: "Game already in progress" }));
      conn.close();
      return;
    }

    this.broadcastState();
  }

  onClose(conn: Party.Connection) {
    if (this.state.players[conn.id]) {
      this.state.players[conn.id].connected = false;
      this.broadcastState();
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    let data: any;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }

    switch (data.type) {
      case "start_round":
        this.handleStartRound(sender.id);
        break;
      case "reveal_pradhan":
        this.handleRevealPradhan(sender.id);
        break;
      case "reveal_police":
        this.handleRevealPolice(sender.id);
        break;
      case "police_guess":
        this.handlePoliceGuess(sender.id, data.targetId);
        break;
      case "next_round":
        this.handleNextRound(sender.id);
        break;
      case "end_game":
        this.handleEndGame(sender.id);
        break;
      case "set_max_players":
        if (sender.id === this.state.hostId && this.state.phase === "lobby") {
          this.state.maxPlayers = data.count === 4 ? 4 : 5;
          this.broadcastState();
        }
        break;
      case "webrtc_signal":
        // Forward WebRTC signaling to the target peer
        for (const conn of this.room.getConnections()) {
          if (conn.id === data.targetId) {
            conn.send(JSON.stringify({
              type: "webrtc_signal",
              fromId: sender.id,
              signal: data.signal,
            }));
          }
        }
        break;
      case "audio_state":
        // Broadcast audio state (talking/muted) to all
        this.broadcast(JSON.stringify({
          type: "audio_state",
          playerId: sender.id,
          talking: data.talking,
        }));
        break;
    }
  }

  handleStartRound(senderId: string) {
    if (senderId !== this.state.hostId) return;

    const playerIds = Object.keys(this.state.players);
    const playerCount = playerIds.length;

    if (playerCount < 4) {
      return; // Need at least 4 players
    }

    this.state.round += 1;
    this.state.phase = "dealing";
    this.state.policeGuess = undefined;
    this.state.guessCorrect = undefined;
    this.state.policeId = undefined;
    this.state.pradhanId = undefined;

    // Assign roles
    let roles: Role[];
    if (playerCount === 4) {
      roles = shuffle(["raja", "rani", "police", "chor"] as Role[]);
    } else {
      roles = shuffle(["raja", "rani", "pradhan", "police", "chor"] as Role[]);
    }

    const shuffledIds = shuffle(playerIds);
    this.state.currentRoles = {};
    for (let i = 0; i < shuffledIds.length; i++) {
      this.state.currentRoles[shuffledIds[i]] = roles[i];
      if (roles[i] === "police") this.state.policeId = shuffledIds[i];
      if (roles[i] === "pradhan") this.state.pradhanId = shuffledIds[i];
    }

    this.broadcastState();

    // Auto-advance to next phase after 3 seconds
    setTimeout(() => {
      if (playerCount === 4) {
        // Skip pradhan reveal for 4 players
        this.state.phase = "reveal_police";
      } else {
        this.state.phase = "reveal_pradhan";
      }
      this.broadcastState();
    }, 3000);
  }

  handleRevealPradhan(senderId: string) {
    if (this.state.currentRoles[senderId] !== "pradhan") return;
    if (this.state.phase !== "reveal_pradhan") return;

    this.state.phase = "reveal_police";
    this.broadcastState();
  }

  handleRevealPolice(senderId: string) {
    if (this.state.currentRoles[senderId] !== "police") return;
    if (this.state.phase !== "reveal_police") return;

    this.state.phase = "police_guess";
    this.broadcastState();
  }

  handlePoliceGuess(senderId: string, targetId: string) {
    if (senderId !== this.state.policeId) return;
    if (this.state.phase !== "police_guess") return;

    this.state.policeGuess = targetId;
    const targetRole = this.state.currentRoles[targetId];
    this.state.guessCorrect = targetRole === "chor";

    const playerCount = Object.keys(this.state.players).length;
    const points = playerCount === 4 ? POINTS_4P : POINTS;

    // Award points
    for (const [id, role] of Object.entries(this.state.currentRoles)) {
      if (role === "police") {
        this.state.players[id].score += this.state.guessCorrect ? points.police : 0;
      } else if (role === "chor") {
        this.state.players[id].score += this.state.guessCorrect ? 0 : points.police;
      } else {
        this.state.players[id].score += points[role];
      }
    }

    this.state.phase = "result";
    this.broadcastState();
  }

  handleNextRound(senderId: string) {
    if (senderId !== this.state.hostId) return;
    this.state.phase = "lobby";
    this.state.currentRoles = {};
    this.state.policeId = undefined;
    this.state.pradhanId = undefined;
    this.state.policeGuess = undefined;
    this.state.guessCorrect = undefined;
    this.broadcastState();
  }

  handleEndGame(senderId: string) {
    if (senderId !== this.state.hostId) return;
    this.state.phase = "scoreboard";
    this.broadcastState();
  }

  broadcastState() {
    for (const conn of this.room.getConnections()) {
      const sanitized = sanitizeStateForPlayer(this.state, conn.id);
      sanitized.yourId = conn.id;
      conn.send(JSON.stringify({ type: "state", data: sanitized }));
    }
  }

  broadcast(message: string) {
    for (const conn of this.room.getConnections()) {
      conn.send(message);
    }
  }
}
