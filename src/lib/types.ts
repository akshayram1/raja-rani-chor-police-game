export type Role = "raja" | "rani" | "chor" | "police" | "pradhan";

export type GamePhase =
  | "lobby"
  | "dealing"
  | "reveal_pradhan"
  | "reveal_police"
  | "police_guess"
  | "result"
  | "scoreboard";

export interface Player {
  id: string;
  name: string;
  role?: Role;
  score: number;
  connected: boolean;
}

export interface GameState {
  phase: GamePhase;
  players: Record<string, Player>;
  hostId: string | null;
  round: number;
  maxPlayers: number;
  policeId?: string;
  pradhanId?: string;
  policeGuess?: string;
  guessCorrect?: boolean;
  yourId?: string;
}

export const ROLE_INFO: Record<
  Role,
  { label: string; emoji: string; hindi: string; points: number; color: string }
> = {
  raja: {
    label: "Raja",
    emoji: "👑",
    hindi: "राजा",
    points: 1000,
    color: "#FFD700",
  },
  rani: {
    label: "Rani",
    emoji: "👸",
    hindi: "रानी",
    points: 900,
    color: "#FF69B4",
  },
  pradhan: {
    label: "Pradhan",
    emoji: "🏛️",
    hindi: "प्रधान",
    points: 800,
    color: "#8B4513",
  },
  police: {
    label: "Police",
    emoji: "🚔",
    hindi: "पुलिस",
    points: 700,
    color: "#4169E1",
  },
  chor: {
    label: "Chor",
    emoji: "🦹",
    hindi: "चोर",
    points: 0,
    color: "#555555",
  },
};

// PartyKit host URL - update this after deploying
export const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST || "localhost:1999";
