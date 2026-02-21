"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { GameState } from "@/lib/types";

interface AudioChatProps {
  socket: any; // PartySocket
  gameState: GameState;
  send: (data: any) => void;
}

export default function AudioChat({ socket, gameState, send }: AudioChatProps) {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [micPermission, setMicPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const myId = gameState.yourId;

  // ICE servers
  const iceConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const enableAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Mute by default (push to talk)
      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });

      localStreamRef.current = stream;
      setAudioEnabled(true);
      setMicPermission("granted");

      // Connect to existing peers
      const otherPlayers = Object.keys(gameState.players).filter(
        (id) => id !== myId
      );
      for (const peerId of otherPlayers) {
        await createPeerConnection(peerId, true);
      }
    } catch (err) {
      console.error("Mic access denied:", err);
      setMicPermission("denied");
    }
  }, [gameState.players, myId]);

  const createPeerConnection = useCallback(
    async (peerId: string, isInitiator: boolean) => {
      if (peersRef.current.has(peerId)) return;

      const pc = new RTCPeerConnection(iceConfig);
      peersRef.current.set(peerId, pc);

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle remote tracks
      pc.ontrack = (event) => {
        let audio = audioElementsRef.current.get(peerId);
        if (!audio) {
          audio = new Audio();
          audio.autoplay = true;
          audioElementsRef.current.set(peerId, audio);
        }
        audio.srcObject = event.streams[0];
      };

      // ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.send(
            JSON.stringify({
              type: "webrtc_signal",
              targetId: peerId,
              signal: {
                type: "ice-candidate",
                candidate: event.candidate,
              },
            })
          );
        }
      };

      // Connection state
      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          pc.close();
          peersRef.current.delete(peerId);
          audioElementsRef.current.delete(peerId);
        }
      };

      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.send(
          JSON.stringify({
            type: "webrtc_signal",
            targetId: peerId,
            signal: { type: "offer", sdp: offer },
          })
        );
      }
    },
    [socket]
  );

  // Handle WebRTC signaling messages
  useEffect(() => {
    if (!socket || !audioEnabled) return;

    const handleMessage = async (event: MessageEvent) => {
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data.type !== "webrtc_signal") return;

      const { fromId, signal } = data;

      if (signal.type === "offer") {
        await createPeerConnection(fromId, false);
        const pc = peersRef.current.get(fromId);
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.send(
          JSON.stringify({
            type: "webrtc_signal",
            targetId: fromId,
            signal: { type: "answer", sdp: answer },
          })
        );
      } else if (signal.type === "answer") {
        const pc = peersRef.current.get(fromId);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        }
      } else if (signal.type === "ice-candidate") {
        const pc = peersRef.current.get(fromId);
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, audioEnabled, createPeerConnection]);

  // Push to talk handlers
  const startTalking = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    setIsTalking(true);
    send({ type: "audio_state", talking: true });
  }, [send]);

  const stopTalking = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    setIsTalking(false);
    send({ type: "audio_state", talking: false });
  }, [send]);

  // Keyboard push-to-talk (Space key)
  useEffect(() => {
    if (!audioEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !isTalking) {
        // Don't trigger if typing in an input
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
          return;
        e.preventDefault();
        startTalking();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        stopTalking();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [audioEnabled, isTalking, startTalking, stopTalking]);

  // Cleanup
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      peersRef.current.forEach((pc) => pc.close());
      audioElementsRef.current.forEach((audio) => {
        audio.srcObject = null;
      });
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!audioEnabled ? (
        <button
          onClick={enableAudio}
          className="ptt-button bg-white/5 hover:bg-white/10"
          title="Enable voice chat"
        >
          <span className="text-xl">🎙️</span>
        </button>
      ) : (
        <button
          onMouseDown={startTalking}
          onMouseUp={stopTalking}
          onMouseLeave={stopTalking}
          onTouchStart={(e) => {
            e.preventDefault();
            startTalking();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopTalking();
          }}
          className={`ptt-button ${isTalking ? "active" : ""}`}
          title="Hold to talk (or hold Space)"
        >
          <span className="text-xl">{isTalking ? "🗣️" : "🎙️"}</span>
        </button>
      )}

      {audioEnabled && (
        <div className="absolute -top-8 right-0 text-[10px] text-gray-500 font-body whitespace-nowrap">
          {isTalking ? "🔴 Talking..." : "Hold to talk"}
        </div>
      )}

      {micPermission === "denied" && (
        <div className="absolute -top-10 right-0 text-[10px] text-red-400 font-body whitespace-nowrap bg-bg-dark px-2 py-1 rounded">
          Mic access denied
        </div>
      )}
    </div>
  );
}
