"use client";

import { useState } from "react";
import { GameState } from "@/lib/types";

interface LobbyProps {
  gameState: GameState;
  isHost: boolean;
  roomId: string;
  send: (data: any) => void;
}

export default function Lobby({ gameState, isHost, roomId, send }: LobbyProps) {
  const [copied, setCopied] = useState(false);
  const playerCount = Object.keys(gameState.players).length;
  const canStart = playerCount >= 4 && playerCount <= 5;

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/${roomId}`
      : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = inviteLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Raja Rani Chor Police game!",
          text: `Join my game room! Code: ${roomId}`,
          url: inviteLink,
        });
      } catch {}
    } else {
      copyLink();
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 animate-slide-up">
      <div className="text-center">
        <div className="text-5xl mb-3">🎴</div>
        <h2 className="font-display text-2xl text-white mb-1">Waiting Room</h2>
        <p className="text-gray-400 font-body text-sm">
          {canStart
            ? isHost
              ? "Ready to start!"
              : "Waiting for host to start..."
            : `Need ${4 - playerCount} more player${
                4 - playerCount !== 1 ? "s" : ""
              }`}
        </p>
      </div>

      {/* Invite section */}
      <div className="game-card p-5 space-y-3">
        <div className="text-xs text-gray-400 font-body">
          Share this link or code with friends:
        </div>

        {/* Room code */}
        <div className="flex items-center justify-center gap-1">
          {roomId.split("").map((char, i) => (
            <div
              key={i}
              className="w-11 h-14 rounded-lg bg-bg-hover border border-white/10 flex items-center justify-center font-display text-xl text-accent-gold"
            >
              {char}
            </div>
          ))}
        </div>

        {/* Copy / Share buttons */}
        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-body font-bold transition-colors"
          >
            {copied ? "✅ Copied!" : "📋 Copy Link"}
          </button>
          <button
            onClick={shareLink}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-body font-bold transition-colors"
          >
            📤 Share
          </button>
        </div>
      </div>

      {/* Player count toggle (host only) */}
      {isHost && gameState.round === 0 && (
        <div className="game-card p-4">
          <div className="text-xs text-gray-400 font-body mb-3">
            Players per game:
          </div>
          <div className="flex gap-2">
            {[4, 5].map((count) => (
              <button
                key={count}
                onClick={() =>
                  send({ type: "set_max_players", count })
                }
                className={`flex-1 py-2.5 rounded-xl text-sm font-body font-bold transition-all ${
                  gameState.maxPlayers === count
                    ? "bg-accent-gold/20 border border-accent-gold/40 text-accent-gold"
                    : "bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {count} Players
                <span className="block text-[10px] font-normal mt-0.5">
                  {count === 4 ? "No Pradhan" : "With Pradhan"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Players list */}
      <div className="game-card p-4">
        <div className="text-xs text-gray-400 font-body mb-3">
          Players ({playerCount}/{gameState.maxPlayers})
        </div>
        <div className="space-y-2">
          {Object.values(gameState.players).map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                {player.name[0].toUpperCase()}
              </div>
              <span className="font-body font-bold text-white text-sm">
                {player.name}
              </span>
              {player.id === gameState.hostId && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold font-body">
                  Host 👑
                </span>
              )}
              {player.id === gameState.yourId &&
                player.id !== gameState.hostId && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400 font-body">
                    You
                  </span>
                )}
              {!player.connected && (
                <span className="ml-auto text-xs text-red-400 font-body">
                  Disconnected
                </span>
              )}
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({
            length: gameState.maxPlayers - playerCount,
          }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed border-white/10"
            >
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                ?
              </div>
              <span className="text-sm text-gray-600 font-body">
                Waiting...
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Start button */}
      {isHost && (
        <button
          onClick={() => send({ type: "start_round" })}
          disabled={!canStart}
          className="w-full py-4 rounded-xl font-bold font-display text-lg text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all animate-pulse-glow"
        >
          {canStart
            ? `Start Round ${gameState.round + 1}! 🎲`
            : `Need ${4 - playerCount} More Players`}
        </button>
      )}
    </div>
  );
}
