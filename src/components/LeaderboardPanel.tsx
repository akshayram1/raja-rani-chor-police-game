"use client";

import { GameState } from "@/lib/types";

interface LeaderboardPanelProps {
  gameState: GameState;
}

export default function LeaderboardPanel({ gameState }: LeaderboardPanelProps) {
  const sortedPlayers = Object.values(gameState.players).sort(
    (a, b) => b.score - a.score
  );

  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

  return (
    <div className="game-card p-4 h-fit sticky top-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <span className="text-lg">🏆</span>
        <h3 className="font-display text-sm text-accent-gold">Leaderboard</h3>
        {gameState.round > 0 && (
          <span className="ml-auto text-[10px] text-gray-500 font-body">
            Round {gameState.round}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all ${
              index === 0 && player.score > 0
                ? "bg-yellow-500/10 border border-yellow-500/20"
                : "bg-white/5"
            }`}
          >
            <div className="text-sm w-6 text-center">
              {player.score > 0 ? medals[index] || `${index + 1}.` : `${index + 1}.`}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-white text-xs font-body truncate">
                  {player.name}
                </span>
                {player.id === gameState.yourId && (
                  <span className="text-[9px] text-gray-500">(you)</span>
                )}
              </div>
            </div>
            <div
              className={`font-bold text-sm font-body ${
                index === 0 && player.score > 0
                  ? "text-accent-gold"
                  : "text-white"
              }`}
            >
              {player.score}
            </div>
          </div>
        ))}
      </div>

      {sortedPlayers.length === 0 && (
        <p className="text-xs text-gray-500 font-body text-center py-4">
          No players yet
        </p>
      )}
    </div>
  );
}
