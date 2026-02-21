"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PartySocket from "partysocket";
import { PARTYKIT_HOST } from "@/lib/types";

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

function generateRoomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function phaseLabel(phase: string): { text: string; color: string } {
  switch (phase) {
    case "lobby":
      return { text: "Waiting", color: "text-green-400" };
    case "dealing":
    case "reveal_pradhan":
    case "reveal_police":
    case "police_guess":
    case "result":
      return { text: "In Game", color: "text-yellow-400" };
    case "scoreboard":
      return { text: "Finished", color: "text-gray-400" };
    default:
      return { text: phase, color: "text-gray-400" };
  }
}

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const socketRef = useRef<PartySocket | null>(null);

  // Connect to lobby for real-time room list
  useEffect(() => {
    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      party: "lobby",
      room: "main",
    });

    socket.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "rooms") {
          setRooms(msg.rooms);
        }
      } catch {}
    });

    socketRef.current = socket;
    return () => {
      socket.close();
    };
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return;
    const roomId = generateRoomId();
    localStorage.setItem("playerName", name.trim());
    router.push(`/room/${roomId}`);
  };

  const handleJoin = () => {
    if (!name.trim() || !joinCode.trim()) return;
    localStorage.setItem("playerName", name.trim());
    router.push(`/room/${joinCode.trim().toUpperCase()}`);
  };

  const handleJoinRoom = (roomId: string) => {
    const playerName = name.trim() || localStorage.getItem("playerName");
    if (!playerName) {
      // Prompt for name first
      setJoinCode(roomId);
      setMode("join");
      return;
    }
    localStorage.setItem("playerName", playerName);
    router.push(`/room/${roomId}`);
  };

  // Sort rooms: lobby rooms first, then by player count desc
  const sortedRooms = [...rooms].sort((a, b) => {
    if (a.phase === "lobby" && b.phase !== "lobby") return -1;
    if (a.phase !== "lobby" && b.phase === "lobby") return 1;
    return b.playerCount - a.playerCount;
  });

  return (
    <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4 animate-float">🃏</div>
          <h1 className="font-display text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 mb-2">
            Raja Rani
          </h1>
          <h2 className="font-display text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-gray-300 to-yellow-600 mb-4">
            Chor Police
          </h2>
          <p className="text-gray-400 font-body text-sm">
            The classic Indian party game — now online!
          </p>
        </div>

        {mode === "home" && (
          <div className="space-y-4 animate-slide-up">
            <button
              onClick={() => setMode("create")}
              className="w-full game-card game-card-hover p-5 text-left transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  ✨
                </div>
                <div>
                  <div className="font-bold text-white text-lg font-body">
                    Create Room
                  </div>
                  <div className="text-gray-400 text-sm">
                    Start a new game & invite friends
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode("join")}
              className="w-full game-card game-card-hover p-5 text-left transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🔗
                </div>
                <div>
                  <div className="font-bold text-white text-lg font-body">
                    Join Room
                  </div>
                  <div className="text-gray-400 text-sm">
                    Enter a room code to join
                  </div>
                </div>
              </div>
            </button>

            {/* Active Rooms Section */}
            {sortedRooms.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <h3 className="text-gray-300 font-body text-sm font-semibold uppercase tracking-wider">
                    Active Rooms ({sortedRooms.length})
                  </h3>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {sortedRooms.map((room) => {
                    const status = phaseLabel(room.phase);
                    const canJoin =
                      room.phase === "lobby" &&
                      room.playerCount < room.maxPlayers;
                    return (
                      <div
                        key={room.id}
                        className="game-card p-4 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-white font-bold text-sm tracking-wider">
                              {room.id}
                            </span>
                            <span
                              className={`text-xs font-body ${status.color}`}
                            >
                              {status.text}
                            </span>
                          </div>
                          <div className="text-gray-500 text-xs font-body mt-0.5 truncate">
                            Host: {room.hostName} •{" "}
                            {room.phase !== "lobby" &&
                              `Round ${room.round}/${room.totalRounds} • `}
                            {room.playerCount}/{room.maxPlayers} players
                          </div>
                        </div>
                        <button
                          onClick={() => handleJoinRoom(room.id)}
                          disabled={!canJoin}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold font-body transition-all whitespace-nowrap ${
                            canJoin
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                              : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                          }`}
                        >
                          {canJoin ? "Join" : room.phase === "lobby" ? "Full" : "In Game"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "create" && (
          <div className="game-card p-6 space-y-5 animate-slide-up">
            <button
              onClick={() => setMode("home")}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>
            <h3 className="font-display text-xl text-white">Create Room</h3>
            <div>
              <label className="text-gray-400 text-sm block mb-2 font-body">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={15}
                className="w-full bg-bg-hover border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold/50 transition-colors font-body"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="w-full py-3 rounded-xl font-bold font-body text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Create & Enter Room
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="game-card p-6 space-y-5 animate-slide-up">
            <button
              onClick={() => setMode("home")}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>
            <h3 className="font-display text-xl text-white">Join Room</h3>
            <div>
              <label className="text-gray-400 text-sm block mb-2 font-body">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={15}
                className="w-full bg-bg-hover border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold/50 transition-colors font-body"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2 font-body">
                Room Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                maxLength={6}
                className="w-full bg-bg-hover border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 transition-colors font-body text-center tracking-[0.3em] text-xl"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={!name.trim() || !joinCode.trim()}
              className="w-full py-3 rounded-xl font-bold font-body text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Join Game
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8 font-body">
          🇮🇳 Made with love • Best played with 4-5 friends
        </p>
      </div>
    </main>
  );
}
