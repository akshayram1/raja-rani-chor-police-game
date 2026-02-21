"use client";

import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { GameState } from "@/lib/types";

interface EmojiReactionsProps {
  send: (data: any) => void;
  gameState: GameState;
}

export interface EmojiReactionsHandle {
  addFloatingEmoji: (emoji: string, playerName: string) => void;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  playerName: string;
  x: number;
  createdAt: number;
}

const EMOJIS = ["😂", "🔥", "👏", "😱", "💀"];

let emojiCounter = 0;

const EmojiReactions = forwardRef<EmojiReactionsHandle, EmojiReactionsProps>(
  ({ send, gameState }, ref) => {
    const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
    const [cooldown, setCooldown] = useState(false);

    const addFloatingEmoji = useCallback(
      (emoji: string, playerName: string) => {
        const id = `emoji-${emojiCounter++}`;
        const x = 20 + Math.random() * 60;

        setFloatingEmojis((prev) => [
          ...prev,
          { id, emoji, playerName, x, createdAt: Date.now() },
        ]);

        setTimeout(() => {
          setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
        }, 2200);
      },
      []
    );

    useImperativeHandle(ref, () => ({
      addFloatingEmoji,
    }));

    const sendEmoji = useCallback(
      (emoji: string) => {
        if (cooldown) return;
        send({ type: "emoji_reaction", emoji });
        setCooldown(true);
        setTimeout(() => setCooldown(false), 1000);
      },
      [send, cooldown]
    );

    return (
      <>
        {/* Floating emojis overlay */}
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {floatingEmojis.map((fe) => (
            <div
              key={fe.id}
              className="absolute animate-emoji-float"
              style={{ left: `${fe.x}%`, bottom: "10%" }}
            >
              <div className="flex flex-col items-center">
                <span className="text-4xl">{fe.emoji}</span>
                <span className="text-[10px] text-white/70 font-body bg-black/40 px-1.5 py-0.5 rounded-full mt-1">
                  {fe.playerName}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Emoji picker bar */}
        <div className="fixed bottom-4 left-4 z-50">
          <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-2 py-1.5">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendEmoji(emoji)}
                disabled={cooldown}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all
                  ${
                    cooldown
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-white/10 hover:scale-110 active:scale-95"
                  }`}
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          {cooldown && (
            <div className="text-[9px] text-gray-500 font-body text-center mt-1">
              wait...
            </div>
          )}
        </div>
      </>
    );
  }
);

EmojiReactions.displayName = "EmojiReactions";

export default EmojiReactions;
