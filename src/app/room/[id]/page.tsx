"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import PartySocket from "partysocket";
import { GameState, ROLE_INFO, Role, PARTYKIT_HOST } from "@/lib/types";
import Lobby from "@/components/Lobby";
import DealingPhase from "@/components/DealingPhase";
import RevealPhase from "@/components/RevealPhase";
import PoliceGuessPhase from "@/components/PoliceGuessPhase";
import ResultPhase from "@/components/ResultPhase";
import Scoreboard from "@/components/Scoreboard";
import AudioChat from "@/components/AudioChat";
import PlayerBar from "@/components/PlayerBar";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import EmojiReactions, { EmojiReactionsHandle } from "@/components/EmojiReactions";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<PartySocket | null>(null);
  const [talkingPlayers, setTalkingPlayers] = useState<Set<string>>(new Set());
  const emojiRef = useRef<EmojiReactionsHandle | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("playerName") || "Player";

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomId,
      query: { name },
    });

    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setConnected(true);
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "state") {
        setGameState(data.data);
      } else if (data.type === "error") {
        setError(data.message);
      } else if (data.type === "audio_state") {
        setTalkingPlayers((prev) => {
          const next = new Set(prev);
          if (data.talking) {
            next.add(data.playerId);
          } else {
            next.delete(data.playerId);
          }
          return next;
        });
      } else if (data.type === "emoji_reaction") {
        emojiRef.current?.addFloatingEmoji(data.emoji, data.playerName);
      }
    });

    socket.addEventListener("close", () => {
      setConnected(false);
    });

    return () => {
      socket.close();
    };
  }, [roomId]);

  const send = useCallback((data: any) => {
    socketRef.current?.send(JSON.stringify(data));
  }, []);

  if (error) {
    return (
      <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="game-card p-8 text-center max-w-sm">
          <div className="text-4xl mb-4">😵</div>
          <h2 className="font-display text-xl text-red-400 mb-2">Oops!</h2>
          <p className="text-gray-400 font-body">{error}</p>
          <a
            href="/"
            className="inline-block mt-6 px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-body transition-colors"
          >
            Go Home
          </a>
        </div>
      </main>
    );
  }

  if (!connected || !gameState) {
    return (
      <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🃏</div>
          <p className="text-gray-400 font-body">Connecting to room...</p>
        </div>
      </main>
    );
  }

  const isHost = gameState.yourId === gameState.hostId;
  const myRole = gameState.players[gameState.yourId!]?.role;
  const playerCount = Object.keys(gameState.players).length;

  return (
    <main className="relative z-10 min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-white transition-colors">
            <span className="text-xl">🃏</span>
          </a>
          <div>
            <span className="text-xs text-gray-500 font-body">Room</span>
            <span className="ml-2 text-sm font-bold text-white/80 font-body tracking-wider">
              {roomId}
            </span>
          </div>
          {gameState.round > 0 && (
            <div className="ml-4 px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 font-body">
              Round {gameState.round}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <span className="text-xs text-gray-500 font-body">
            {playerCount}/{gameState.maxPlayers}
          </span>
        </div>
      </div>

      {/* Players bar */}
      <PlayerBar
        players={gameState.players}
        yourId={gameState.yourId!}
        hostId={gameState.hostId!}
        talkingPlayers={talkingPlayers}
        phase={gameState.phase}
      />

      {/* Main content area with leaderboard */}
      <div className="flex-1 flex">
        {/* Main game area */}
        <div className="flex-1 flex items-center justify-center p-4">
          {gameState.phase === "lobby" && (
            <Lobby
              gameState={gameState}
              isHost={isHost}
              roomId={roomId}
              send={send}
            />
          )}
          {gameState.phase === "dealing" && (
            <DealingPhase gameState={gameState} />
          )}
          {(gameState.phase === "reveal_pradhan" ||
            gameState.phase === "reveal_police") && (
            <RevealPhase gameState={gameState} send={send} />
          )}
          {gameState.phase === "police_guess" && (
            <PoliceGuessPhase gameState={gameState} send={send} />
          )}
          {gameState.phase === "result" && (
            <ResultPhase gameState={gameState} isHost={isHost} send={send} />
          )}
          {gameState.phase === "scoreboard" && (
            <Scoreboard gameState={gameState} />
          )}
        </div>

        {/* Right panel - Leaderboard (always visible) */}
        <div className="hidden md:block w-64 p-4 border-l border-white/5">
          <LeaderboardPanel gameState={gameState} />
        </div>
      </div>

      {/* Emoji reactions */}
      <EmojiReactions
        ref={emojiRef}
        send={send}
        gameState={gameState}
      />

      {/* Audio chat */}
      <AudioChat
        socket={socketRef.current!}
        gameState={gameState}
        send={send}
      />
    </main>
  );
}
