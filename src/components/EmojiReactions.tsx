"use client";

import { useState, useCallback, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { GameState } from "@/lib/types";

interface ChatMessage {
  id: string;
  playerName: string;
  text: string;
  timestamp: number;
}

interface EmojiReactionsProps {
  send: (data: any) => void;
  gameState: GameState;
}

export interface EmojiReactionsHandle {
  addFloatingEmoji: (emoji: string, playerName: string) => void;
  addChatMessage: (playerName: string, text: string) => void;
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
let chatCounter = 0;

const EmojiReactions = forwardRef<EmojiReactionsHandle, EmojiReactionsProps>(
  ({ send, gameState }, ref) => {
    const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
    const [cooldown, setCooldown] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const addChatMessage = useCallback(
      (playerName: string, text: string) => {
        const msg: ChatMessage = {
          id: `chat-${chatCounter++}`,
          playerName,
          text,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev.slice(-50), msg]); // keep last 50
        setUnreadCount((prev) => prev + 1);
      },
      []
    );

    useImperativeHandle(ref, () => ({
      addFloatingEmoji,
      addChatMessage,
    }));

    // Scroll chat to bottom on new messages
    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Clear unread when chat is opened
    useEffect(() => {
      if (chatOpen) setUnreadCount(0);
    }, [chatOpen]);

    const sendEmoji = useCallback(
      (emoji: string) => {
        if (cooldown) return;
        send({ type: "emoji_reaction", emoji });
        setCooldown(true);
        setTimeout(() => setCooldown(false), 1000);
      },
      [send, cooldown]
    );

    const sendChat = useCallback(() => {
      const text = chatInput.trim();
      if (!text) return;
      send({ type: "chat_message", text });
      setChatInput("");
      inputRef.current?.focus();
    }, [send, chatInput]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendChat();
        }
      },
      [sendChat]
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

        {/* Chat panel */}
        {chatOpen && (
          <div className="fixed bottom-16 left-4 z-50 w-80 max-h-96 flex flex-col bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
              <span className="text-sm font-bold text-white font-body">💬 Room Chat</span>
              <button
                onClick={() => setChatOpen(false)}
                className="text-gray-400 hover:text-white text-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[280px]">
              {chatMessages.length === 0 && (
                <p className="text-center text-gray-600 text-xs font-body py-8">
                  No messages yet. Say something! 👋
                </p>
              )}
              {chatMessages.map((msg) => {
                const isMe = msg.playerName === gameState.players[gameState.yourId!]?.name;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <span className="text-[10px] text-gray-500 font-body mb-0.5 px-1">
                      {msg.playerName}
                    </span>
                    <div
                      className={`px-3 py-1.5 rounded-2xl text-sm font-body max-w-[85%] break-words ${
                        isMe
                          ? "bg-blue-600/80 text-white rounded-br-md"
                          : "bg-white/10 text-gray-200 rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 p-2.5 border-t border-white/10">
              <input
                ref={inputRef}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                maxLength={200}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-body placeholder:text-gray-500 outline-none focus:border-blue-500/50 transition-colors"
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim()}
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all"
              >
                ➤
              </button>
            </div>
          </div>
        )}

        {/* Emoji picker + chat toggle bar */}
        <div className="fixed bottom-4 left-4 z-50">
          <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-2 py-1.5">
            {/* Chat toggle */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all relative
                ${chatOpen ? "bg-blue-600/30 text-blue-400" : "hover:bg-white/10 hover:scale-110 active:scale-95"}`}
              title="Toggle chat"
            >
              💬
              {!chatOpen && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <div className="w-px h-6 bg-white/10" />

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
