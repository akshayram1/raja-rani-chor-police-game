"use client";

import { Player, GamePhase, ROLE_INFO, Role } from "@/lib/types";

interface PlayerBarProps {
  players: Record<string, Player>;
  yourId: string;
  hostId: string;
  talkingPlayers: Set<string>;
  phase: GamePhase;
}

export default function PlayerBar({
  players,
  yourId,
  hostId,
  talkingPlayers,
  phase,
}: PlayerBarProps) {
  const playerList = Object.values(players);

  return (
    <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-white/5">
      {playerList.map((player) => {
        const isTalking = talkingPlayers.has(player.id);
        const isYou = player.id === yourId;
        const isHost = player.id === hostId;
        const showRole = player.role && phase !== "lobby" && phase !== "dealing";

        return (
          <div
            key={player.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl min-w-fit transition-all ${
              isYou ? "bg-white/10 border border-white/10" : "bg-white/5"
            } ${isTalking ? "talking-ring" : ""} ${
              !player.connected ? "opacity-40" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                showRole
                  ? `role-${player.role}`
                  : "bg-gradient-to-br from-gray-600 to-gray-700"
              }`}
            >
              {showRole
                ? ROLE_INFO[player.role as Role].emoji
                : player.name[0].toUpperCase()}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white font-body truncate max-w-[80px]">
                  {player.name}
                  {isYou && (
                    <span className="text-gray-400 font-normal"> (you)</span>
                  )}
                </span>
                {isHost && <span className="text-[10px]">👑</span>}
              </div>
              <span className="text-[10px] text-gray-500 font-body">
                {player.score} pts
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
