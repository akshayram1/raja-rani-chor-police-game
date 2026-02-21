"use client";

import { useState, useEffect } from "react";
import { GameState, ROLE_INFO, Role } from "@/lib/types";

interface DealingPhaseProps {
  gameState: GameState;
}

export default function DealingPhase({ gameState }: DealingPhaseProps) {
  const [flipped, setFlipped] = useState(false);
  const myRole = gameState.players[gameState.yourId!]?.role;

  useEffect(() => {
    const timer = setTimeout(() => setFlipped(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const roleInfo = myRole ? ROLE_INFO[myRole] : null;

  return (
    <div className="flex flex-col items-center gap-6 animate-slide-up">
      <h2 className="font-display text-xl text-gray-300">
        Your Chit for Round {gameState.round}
      </h2>

      {/* Card */}
      <div className="chit-card" onClick={() => setFlipped(!flipped)}>
        <div className={`chit-inner ${flipped ? "flipped" : ""}`}>
          {/* Front - face down */}
          <div className="chit-front">
            <div className="text-5xl mb-3">🃏</div>
            <div className="text-sm text-gray-400 font-body">
              Tap to reveal
            </div>
          </div>

          {/* Back - role revealed */}
          <div className={`chit-back role-${myRole || "chor"}`}>
            {roleInfo && (
              <>
                <div className="text-6xl mb-2">{roleInfo.emoji}</div>
                <div className="font-display text-2xl">{roleInfo.label}</div>
                <div className="text-lg opacity-80 mt-1">{roleInfo.hindi}</div>
                <div className="mt-3 px-4 py-1.5 rounded-full bg-black/20 text-sm font-body font-bold">
                  {roleInfo.points} pts
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-400 font-body text-sm text-center">
        Remember your role! Don&apos;t tell anyone 🤫
      </p>
    </div>
  );
}
