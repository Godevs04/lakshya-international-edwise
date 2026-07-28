"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type SocketMessage = {
  id: string;
  conversationId: string;
  senderType: string;
  body: string;
  createdAt: string;
};

type Options = {
  enabled: boolean;
  visitorId?: string;
  asVisitor?: boolean;
  conversationId?: string | null;
  onMessage?: (message: SocketMessage) => void;
  onTyping?: (payload: { who: string; name?: string }) => void;
  onStopTyping?: () => void;
  onAssigned?: (payload: unknown) => void;
  onClosed?: (payload: unknown) => void;
};

export function useSupportSocket(options: Options) {
  const socketRef = useRef<Socket | null>(null);
  const optionsRef = useRef(options);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!options.enabled) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      queueMicrotask(() => setConnected(false));
      return;
    }

    // Skip when build marked realtime unavailable (Vercel without dedicated socket host).
    if (process.env.NEXT_PUBLIC_SUPPORT_REALTIME === "0") {
      queueMicrotask(() => setConnected(false));
      return;
    }

    // Custom server (server.ts) hosts Socket.IO. Optional dedicated host via
    // NEXT_PUBLIC_SUPPORT_SOCKET_URL (e.g. Fly) when the web app is on Vercel.
    const socketUrl = process.env.NEXT_PUBLIC_SUPPORT_SOCKET_URL || undefined;
    const socket = io(socketUrl, {
      path: "/api/socketio",
      addTrailingSlash: false,
      withCredentials: true,
      // Avoid endless 404 spam when /api/socketio is missing.
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 8000,
      auth: options.asVisitor ? { asVisitor: true, visitorId: options.visitorId } : {},
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socket.on("newMessage", (message: SocketMessage) => optionsRef.current.onMessage?.(message));
    socket.on("typing", (payload) => optionsRef.current.onTyping?.(payload));
    socket.on("stopTyping", () => optionsRef.current.onStopTyping?.());
    socket.on("conversationAssigned", (payload) => optionsRef.current.onAssigned?.(payload));
    socket.on("conversationClosed", (payload) => optionsRef.current.onClosed?.(payload));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [options.enabled, options.asVisitor, options.visitorId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !options.conversationId || !connected) return;
    socket.emit("joinConversation", { conversationId: options.conversationId });
    return () => {
      socket.emit("leaveConversation", { conversationId: options.conversationId });
    };
  }, [options.conversationId, connected]);

  const sendMessage = useCallback(
    (body: string) =>
      new Promise<SocketMessage>((resolve, reject) => {
        const socket = socketRef.current;
        const conversationId = optionsRef.current.conversationId;
        if (!socket || !conversationId) {
          reject(new Error("Not connected"));
          return;
        }
        socket.emit(
          "newMessage",
          { conversationId, body, type: "text" },
          (ack: { ok?: boolean; message?: SocketMessage; error?: string }) => {
            if (ack?.ok && ack.message) resolve(ack.message);
            else reject(new Error(ack?.error ?? "Send failed"));
          }
        );
      }),
    []
  );

  const emitTyping = useCallback((typing: boolean) => {
    const socket = socketRef.current;
    const conversationId = optionsRef.current.conversationId;
    if (!socket || !conversationId) return;
    socket.emit(typing ? "typing" : "stopTyping", { conversationId });
  }, []);

  const markSeen = useCallback(() => {
    const socket = socketRef.current;
    const conversationId = optionsRef.current.conversationId;
    if (!socket || !conversationId) return;
    socket.emit("messageSeen", { conversationId });
  }, []);

  return { connected, sendMessage, emitTyping, markSeen };
}
