"use client";

import { GameState, ROLE_INFO } from "@/lib/types";

interface RevealPhaseProps {
  gameState: GameState;
  send: (data: any) => void;
}

export default function RevealPhase({ gameState, send }: RevealPhaseProps) {
  const isPradhanPhase = gameState.phase === "reveal_pradhan";
  const isPolicePhase = gameState.phase === "reveal_police";

  const myRole = gameState.players[gameState.yourId!]?.role;
  const isPradhan = myRole === "pradhan";
  const isPolice = myRole === "police";

  const pradhanPlayer = gameState.pradhanId
    ? gameState.players[gameState.pradhanId]
    : null;
  const policePlayer = gameState.policeId
    ? gameState.players[gameState.policeId]
    : null;

  // If it's pradhan phase and I'm pradhan, show reveal button
  if (isPradhanPhase) {
    if (isPradhan) {
      return (
        <div className="flex flex-col items-center gap-6 animate-slide-up">
          <div className="text-5xl">🏛️</div>
          <h2 className="font-display text-2xl text-white">
            You are the Pradhan!
          </h2>
          <p className="text-gray-400 font-body text-center max-w-xs">
            Reveal yourself to everyone by pressing the button below.
          </p>
          <button
            onClick={() => send({ type: "reveal_pradhan" })}
            className="px-8 py-4 rounded-xl font-bold font-display text-lg text-white bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-900/30"
          >
            🏛️ I am the Pradhan!
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-6 animate-slide-up">
        <div className="text-5xl animate-float">🏛️</div>
        <h2 className="font-display text-xl text-gray-300">
          Waiting for Pradhan to reveal...
        </h2>
        <p className="text-gray-400 font-body text-sm text-center">
          The Pradhan must step forward and reveal themselves
        </p>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-700 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-amber-700 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-amber-700 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  // Police phase
  if (isPolicePhase) {
    if (isPolice) {
      return (
        <div className="flex flex-col items-center gap-6 animate-slide-up">
          <div className="text-5xl">🚔</div>
          <h2 className="font-display text-2xl text-white">
            You are the Police!
          </h2>
          <p className="text-gray-400 font-body text-center max-w-xs">
            Reveal yourself, then you&apos;ll need to find the Chor!
          </p>
          <button
            onClick={() => send({ type: "reveal_police" })}
            className="px-8 py-4 rounded-xl font-bold font-display text-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-900/30"
          >
            🚔 I am the Police!
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-6 animate-slide-up">
        {pradhanPlayer && (
          <div className="game-card px-4 py-2 flex items-center gap-2 mb-2">
            <span className="text-sm">🏛️</span>
            <span className="text-sm font-body text-amber-400">
              {pradhanPlayer.name} is the Pradhan
            </span>
          </div>
        )}
        <div className="text-5xl animate-float">🚔</div>
        <h2 className="font-display text-xl text-gray-300">
          Pradhan asks: Who is the Police?
        </h2>
        <p className="text-gray-400 font-body text-sm text-center">
          The Police must step forward and reveal themselves
        </p>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return null;
}
