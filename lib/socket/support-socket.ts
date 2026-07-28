import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/config/env";
import { connectDB } from "@/lib/db/mongoose";
import { SupportConversation } from "@/models/SupportConversation";
import {
  appendSupportMessage,
  markMessagesSeen,
} from "@/lib/services/support-conversation.service";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { resolveUserPermissions } from "@/lib/auth/permissions";
import type { UserRole } from "@/types";

export type SupportSocketServer = Server;

declare global {
  var supportIo: SupportSocketServer | undefined;
}

type SocketAuth =
  | { kind: "agent"; userId: string; name: string; role: UserRole; permissions: string[] }
  | { kind: "visitor"; visitorId: string };

function getCookieValue(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return undefined;
}

async function authenticateSocket(socket: Socket): Promise<SocketAuth | null> {
  const visitorId = socket.handshake.auth?.visitorId as string | undefined;
  const asVisitor = socket.handshake.auth?.asVisitor === true;

  if (asVisitor && visitorId) {
    return { kind: "visitor", visitorId };
  }

  const cookie = socket.handshake.headers.cookie;
  const req = {
    headers: { cookie: cookie ?? "" },
    cookies: {
      get: (name: string) => {
        const value = getCookieValue(cookie, name);
        return value ? { name, value } : undefined;
      },
    },
  };

  try {
    const token = await getToken({
      req,
      secret: getAuthSecret(),
      secureCookie: process.env.NODE_ENV === "production",
    });
    if (!token?.id || !token.role) return null;
    const role = token.role as UserRole;
    const permissions = (token.permissions as string[] | undefined) ?? resolveUserPermissions(role);
    const user = {
      id: token.id as string,
      email: (token.email as string) ?? "",
      name: (token.name as string) ?? "Agent",
      role,
      permissions,
    };
    if (!hasPermission(user, PERMISSIONS.SUPPORT_READ)) return null;
    return {
      kind: "agent",
      userId: user.id,
      name: user.name,
      role,
      permissions,
    };
  } catch {
    return null;
  }
}

export function getSupportIo(): SupportSocketServer | undefined {
  return global.supportIo;
}

export function emitSupportEvent(conversationId: string, event: string, payload: unknown) {
  global.supportIo?.to(`conversation:${conversationId}`).emit(event, payload);
}

export function attachSupportSocket(httpServer: HttpServer): SupportSocketServer {
  if (global.supportIo) {
    return global.supportIo;
  }

  const io = new Server(httpServer, {
    path: "/api/socketio",
    cors: {
      origin: true,
      credentials: true,
    },
    addTrailingSlash: false,
  });

  io.use(async (socket, next) => {
    const auth = await authenticateSocket(socket);
    if (!auth) {
      next(new Error("Unauthorized"));
      return;
    }
    socket.data.auth = auth;
    next();
  });

  io.on("connection", (socket) => {
    const auth = socket.data.auth as SocketAuth;

    if (auth.kind === "agent") {
      socket.join("agents");
      io.to("agents").emit("agentOnline", { userId: auth.userId, name: auth.name });
    }

    socket.on("joinConversation", async (payload: { conversationId?: string }, ack?) => {
      try {
        const conversationId = payload?.conversationId;
        if (!conversationId) throw new Error("conversationId required");
        await connectDB();
        const conversation = await SupportConversation.findById(conversationId).lean();
        if (!conversation) throw new Error("Not found");

        if (auth.kind === "visitor" && conversation.visitorId !== auth.visitorId) {
          throw new Error("Forbidden");
        }

        socket.join(`conversation:${conversationId}`);
        ack?.({ ok: true });
      } catch (error) {
        ack?.({
          ok: false,
          error: error instanceof Error ? error.message : "join failed",
        });
      }
    });

    socket.on("leaveConversation", (payload: { conversationId?: string }) => {
      if (payload?.conversationId) {
        socket.leave(`conversation:${payload.conversationId}`);
      }
    });

    socket.on(
      "newMessage",
      async (
        payload: { conversationId?: string; body?: string; type?: "text" | "image" | "file" },
        ack?
      ) => {
        try {
          const conversationId = payload?.conversationId;
          const body = payload?.body?.trim();
          if (!conversationId || !body) throw new Error("Invalid message");

          await connectDB();
          const conversation = await SupportConversation.findById(conversationId).lean();
          if (!conversation) throw new Error("Not found");
          if (conversation.status === "closed" || conversation.status === "resolved") {
            throw new Error("Conversation closed");
          }
          if (auth.kind === "visitor" && conversation.visitorId !== auth.visitorId) {
            throw new Error("Forbidden");
          }
          if (
            auth.kind === "agent" &&
            !hasPermission(
              {
                id: auth.userId,
                email: "",
                name: auth.name,
                role: auth.role,
                permissions: auth.permissions,
              },
              PERMISSIONS.SUPPORT_WRITE
            )
          ) {
            throw new Error("Forbidden");
          }

          const message = await appendSupportMessage({
            conversationId,
            senderType: auth.kind === "agent" ? "agent" : "visitor",
            senderId: auth.kind === "agent" ? auth.userId : undefined,
            body,
            type: payload.type ?? "text",
          });

          const dto = {
            id: message._id.toString(),
            conversationId,
            senderType: message.senderType,
            senderId: message.senderId?.toString(),
            type: message.type,
            body: message.body,
            createdAt: message.createdAt.toISOString(),
            deliveredAt: message.deliveredAt?.toISOString(),
          };

          io.to(`conversation:${conversationId}`).emit("newMessage", dto);
          io.to("agents").emit("conversationUpdated", {
            conversationId,
            lastMessagePreview: dto.body.slice(0, 140),
            lastMessageAt: dto.createdAt,
          });
          ack?.({ ok: true, message: dto });
        } catch (error) {
          ack?.({
            ok: false,
            error: error instanceof Error ? error.message : "send failed",
          });
        }
      }
    );

    socket.on("typing", (payload: { conversationId?: string }) => {
      if (!payload?.conversationId) return;
      socket.to(`conversation:${payload.conversationId}`).emit("typing", {
        conversationId: payload.conversationId,
        who: auth.kind,
        name: auth.kind === "agent" ? auth.name : "Visitor",
      });
    });

    socket.on("stopTyping", (payload: { conversationId?: string }) => {
      if (!payload?.conversationId) return;
      socket.to(`conversation:${payload.conversationId}`).emit("stopTyping", {
        conversationId: payload.conversationId,
        who: auth.kind,
      });
    });

    socket.on("messageSeen", async (payload: { conversationId?: string }, ack?) => {
      try {
        if (!payload?.conversationId) throw new Error("conversationId required");
        await markMessagesSeen({
          conversationId: payload.conversationId,
          viewer: auth.kind === "agent" ? "agent" : "visitor",
        });
        socket.to(`conversation:${payload.conversationId}`).emit("messageSeen", {
          conversationId: payload.conversationId,
          viewer: auth.kind,
        });
        ack?.({ ok: true });
      } catch (error) {
        ack?.({
          ok: false,
          error: error instanceof Error ? error.message : "seen failed",
        });
      }
    });

    socket.on("disconnect", () => {
      if (auth.kind === "agent") {
        io.to("agents").emit("agentOffline", { userId: auth.userId });
      }
    });
  });

  global.supportIo = io;
  return io;
}
