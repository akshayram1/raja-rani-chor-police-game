"use client";

import { GameState, ROLE_INFO } from "@/lib/types";

interface PoliceGuessPhaseProps {
  gameState: GameState;
  send: (data: any) => void;
}

export default function PoliceGuessPhase({
  gameState,
  send,
}: PoliceGuessPhaseProps) {
  const isPolice = gameState.yourId === gameState.policeId;
  const playerCount = Object.keys(gameState.players).length;

  // Suspects = everyone except police and pradhan
  const suspects = Object.values(gameState.players).filter((p) => {
    if (p.id === gameState.policeId) return false;
    if (p.id === gameState.pradhanId) return false;
    return true;
  });

  const policePlayer = gameState.policeId
    ? gameState.players[gameState.policeId]
    : null;

  if (isPolice) {
    return (
      <div className="w-full max-w-md space-y-6 animate-slide-up">
        <div className="text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h2 className="font-display text-2xl text-white">
            Find the Chor!
          </h2>
          <p className="text-gray-400 font-body text-sm mt-2">
            Tap on the person you think is the Chor
          </p>
        </div>

        <div className="space-y-3">
          {suspects.map((player) => (
            <button
              key={player.id}
              onClick={() =>
                send({ type: "police_guess", targetId: player.id })
              }
              className="w-full game-card game-card-hover p-4 flex items-center gap-4 transition-all hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(255,68,68,0.1)] active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-lg font-bold text-white">
                {player.name[0].toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-bold text-white font-body">
                  {player.name}
                </div>
                <div className="text-xs text-gray-500 font-body">
                  Suspect 🤨
                </div>
              </div>
              <div className="ml-auto text-2xl">👆</div>
            </button>
          ))}
        </div>

        <p className="text-center text-gray-500 text-xs font-body">
          Choose wisely! If wrong, the Chor gets your points 😱
        </p>
      </div>
    );
  }

  // Non-police view
  return (
    <div className="flex flex-col items-center gap-6 animate-slide-up">
      <div className="text-5xl animate-float">🔍</div>
      <h2 className="font-display text-xl text-gray-300">
        {policePlayer?.name} is investigating...
      </h2>
      <p className="text-gray-400 font-body text-sm text-center max-w-xs">
        The Police is deciding who the Chor is.
        {gameState.players[gameState.yourId!]?.role === "chor" && (
          <span className="block mt-2 text-red-400">
            Stay calm... don&apos;t look suspicious! 😰
          </span>
        )}
      </p>
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
