"use client";

import { GameState, ROLE_INFO, Role } from "@/lib/types";

interface ScoreboardProps {
  gameState: GameState;
}

export default function Scoreboard({ gameState }: ScoreboardProps) {
  const sortedPlayers = Object.values(gameState.players).sort(
    (a, b) => b.score - a.score
  );

  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

  return (
    <div className="w-full max-w-md space-y-6 animate-slide-up">
      <div className="text-center">
        <div className="text-6xl mb-3">🏆</div>
        <h2 className="font-display text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          Game Over!
        </h2>
        <p className="text-gray-400 font-body text-sm mt-2">
          After {gameState.round} round{gameState.round !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Winner spotlight */}
      {sortedPlayers[0] && (
        <div className="game-card p-6 text-center border-yellow-500/20 animate-pulse-glow">
          <div className="text-5xl mb-2">👑</div>
          <div className="font-display text-2xl text-accent-gold">
            {sortedPlayers[0].name}
          </div>
          <div className="text-3xl font-bold text-white font-body mt-1">
            {sortedPlayers[0].score}
          </div>
          <div className="text-gray-400 text-sm font-body">points</div>
        </div>
      )}

      {/* Full leaderboard */}
      <div className="game-card p-4 space-y-2">
        <div className="text-xs text-gray-400 font-body mb-3">
          Final Standings
        </div>
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              index === 0
                ? "bg-yellow-500/10 border border-yellow-500/20"
                : "bg-white/5"
            }`}
          >
            <div className="text-xl w-8 text-center">{medals[index]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-body">
                  {player.name}
                </span>
                {player.id === gameState.yourId && (
                  <span className="text-[10px] text-gray-500">(you)</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div
                className={`font-bold text-lg font-body ${
                  index === 0 ? "text-accent-gold" : "text-white"
                }`}
              >
                {player.score}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Play again */}
      <a
        href="/"
        className="block w-full py-3 rounded-xl font-bold font-body text-center text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all"
      >
        Play Again 🎮
      </a>
    </div>
  );
}
