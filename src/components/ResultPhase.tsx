"use client";

import { useEffect, useState } from "react";
import { GameState, ROLE_INFO, Role } from "@/lib/types";

interface ResultPhaseProps {
  gameState: GameState;
  isHost: boolean;
  send: (data: any) => void;
}

export default function ResultPhase({
  gameState,
  isHost,
  send,
}: ResultPhaseProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const correct = gameState.guessCorrect;
  const policePlayer = gameState.policeId
    ? gameState.players[gameState.policeId]
    : null;
  const guessedPlayer = gameState.policeGuess
    ? gameState.players[gameState.policeGuess]
    : null;

  useEffect(() => {
    if (correct) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [correct]);

  // Sort players by score for display
  const sortedPlayers = Object.values(gameState.players).sort(
    (a, b) => b.score - a.score
  );

  return (
    <div className="w-full max-w-md space-y-6 animate-slide-up">
      {/* Confetti */}
      {showConfetti &&
        Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1}s`,
              backgroundColor: ["#FFD700", "#FF69B4", "#4169E1", "#22C55E", "#FF4444"][
                Math.floor(Math.random() * 5)
              ],
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
            }}
          />
        ))}

      {/* Result header */}
      <div className="text-center">
        <div className="text-6xl mb-3">{correct ? "🎉" : "😈"}</div>
        <h2 className="font-display text-2xl text-white mb-2">
          {correct ? "Chor Caught!" : "Chor Escaped!"}
        </h2>
        <p className="text-gray-400 font-body text-sm">
          {policePlayer?.name}{" "}
          {correct ? "correctly identified" : "wrongly accused"}{" "}
          {guessedPlayer?.name}
        </p>
      </div>

      {/* All roles revealed */}
      <div className="game-card p-4 space-y-2">
        <div className="text-xs text-gray-400 font-body mb-3">
          Round {gameState.round} — All Roles Revealed
        </div>
        {sortedPlayers.map((player) => {
          const role = player.role as Role;
          const roleInfo = role ? ROLE_INFO[role] : null;
          const isChor = role === "chor";
          const isGuessed = player.id === gameState.policeGuess;

          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isChor
                  ? correct
                    ? "bg-red-500/10 border border-red-500/20"
                    : "bg-green-500/10 border border-green-500/20"
                  : "bg-white/5"
              } ${isGuessed && !isChor ? "border border-yellow-500/20" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg role-${role}`}
              >
                {roleInfo?.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-body text-sm">
                    {player.name}
                  </span>
                  {player.id === gameState.yourId && (
                    <span className="text-[10px] text-gray-500">(you)</span>
                  )}
                </div>
                <div className="text-xs font-body" style={{ color: roleInfo?.color }}>
                  {roleInfo?.emoji} {roleInfo?.label} — {roleInfo?.hindi}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-white text-sm font-body">
                  {player.score}
                </div>
                <div className="text-[10px] text-gray-500 font-body">pts</div>
              </div>

              {isGuessed && (
                <div className="text-lg">
                  {isChor ? "🚨" : "❌"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Host controls */}
      {isHost && (
        <div className="flex gap-3">
          <button
            onClick={() => send({ type: "next_round" })}
            className="flex-1 py-3 rounded-xl font-bold font-body text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 transition-all"
          >
            Next Round ▶️
          </button>
          <button
            onClick={() => send({ type: "end_game" })}
            className="px-5 py-3 rounded-xl font-bold font-body text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
          >
            End Game
          </button>
        </div>
      )}

      {!isHost && (
        <p className="text-center text-gray-500 text-xs font-body">
          Waiting for host to start next round...
        </p>
      )}
    </div>
  );
}
