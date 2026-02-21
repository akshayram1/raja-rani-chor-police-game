import type * as Party from "partykit/server";

// ─── Types ───────────────────────────────────────────────────────────
interface RoomInfo {
  id: string;
  playerCount: number;
  maxPlayers: number;
  phase: string;
  hostName: string;
  round: number;
  totalRounds: number;
  updatedAt: number;
}

// ─── Lobby Server ────────────────────────────────────────────────────
// A single lobby room ("main") tracks all active game rooms.
// Game servers POST updates here; home-page clients connect via WebSocket.

const STALE_TIMEOUT = 60_000; // Remove rooms not updated for 60s

export default class LobbyServer implements Party.Server {
  rooms: Map<string, RoomInfo> = new Map();
  cleanupHandle?: ReturnType<typeof setInterval>;

  constructor(readonly room: Party.Room) {}

  onStart() {
    // Periodically remove stale rooms
    this.cleanupHandle = setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [id, info] of this.rooms) {
        if (now - info.updatedAt > STALE_TIMEOUT) {
          this.rooms.delete(id);
          changed = true;
        }
      }
      if (changed) this.broadcastRooms();
    }, 15_000);
  }

  onConnect(conn: Party.Connection) {
    // Send current room list immediately
    conn.send(
      JSON.stringify({
        type: "rooms",
        rooms: Array.from(this.rooms.values()),
      })
    );
  }

  async onRequest(req: Party.Request) {
    // CORS headers for cross-origin fetches
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (req.method === "POST") {
      try {
        const data: any = await req.json();

        if (data.action === "update") {
          this.rooms.set(data.roomId, {
            id: data.roomId,
            playerCount: data.playerCount,
            maxPlayers: data.maxPlayers,
            phase: data.phase,
            hostName: data.hostName,
            round: data.round,
            totalRounds: data.totalRounds,
            updatedAt: Date.now(),
          });
        } else if (data.action === "remove") {
          this.rooms.delete(data.roomId);
        }

        this.broadcastRooms();
        return new Response("OK", { status: 200, headers });
      } catch {
        return new Response("Bad request", { status: 400, headers });
      }
    }

    // GET → return current list as JSON
    return new Response(
      JSON.stringify(Array.from(this.rooms.values())),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }

  broadcastRooms() {
    const message = JSON.stringify({
      type: "rooms",
      rooms: Array.from(this.rooms.values()),
    });
    for (const conn of this.room.getConnections()) {
      conn.send(message);
    }
  }
}
